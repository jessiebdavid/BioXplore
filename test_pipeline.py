"""Pipeline tests: the 8 example queries end-to-end via the local fallback,
plus evidence-labelling and honesty guarantees."""

from __future__ import annotations

from partb.contracts.enums import Dimension, Domain, EvidenceLabel
from partb.contracts.models import RetrievalResult
from partb.retrieval.service import retrieve, retrieve_from_raw

EIGHT_QUERIES = [
    "Black holes",
    "Plasma oscillation",
    "Black hole vs white hole",
    "How are Kepler's laws related to orbital period?",
    "How does gene expression change over time?",
    "How does a mutation affect DNA, protein structure, cellular function and disease progression?",
    "What does Thirukkural say about water?",
    "Can biological rhythms be compared conceptually with orbital periods?",
]


def test_all_eight_queries_produce_valid_results():
    for q in EIGHT_QUERIES:
        result = retrieve_from_raw(q)
        assert isinstance(result, RetrievalResult), q
        assert result.retrieval_meta["engine"], q
        assert isinstance(result.not_found, list)
        assert isinstance(result.warnings, list)


def test_black_holes(kb):
    result = retrieve_from_raw("Black holes")
    ids = {i.id for i in result.items}
    assert "astro_black_hole_def" in ids
    assert any(i.dimension == Dimension.ONE_D for i in result.items)
    assert all(i.evidence_label in set(EvidenceLabel) for i in result.items)


def test_plasma_oscillation(kb):
    result = retrieve_from_raw("Plasma oscillation")
    ids = {i.id for i in result.items}
    assert "astro_plasma_oscillation_def" in ids
    assert "astro_plasma_oscillation_mechanism" in ids


def test_black_hole_vs_white_hole(kb):
    result = retrieve_from_raw("Black hole vs white hole")
    ids = {i.id for i in result.items}
    assert "astro_black_hole_def" in ids
    # white hole content must be speculative-labelled
    wh = [i for i in result.items if "white hole" in i.title.lower()]
    assert wh and all(i.evidence_label == EvidenceLabel.HYPOTHESIS for i in wh)


def test_kepler_relationship(kb):
    result = retrieve_from_raw("How are Kepler's laws related to orbital period?")
    rels = result.relationships
    assert any(
        r.from_entity == "kepler's laws" and r.to_entity == "orbital period"
        and r.evidence_label == EvidenceLabel.FACT
        for r in rels
    )
    assert any(i.id == "astro_kepler_laws" for i in result.items)


def test_gene_expression_over_time(kb):
    result = retrieve_from_raw("How does gene expression change over time?")
    ids = {i.id for i in result.items}
    assert "bio_gene_expression_time" in ids
    assert any(i.dimension == Dimension.FOUR_D for i in result.items)


def test_mutation_chain(kb):
    result = retrieve_from_raw(
        "How does a mutation affect DNA, protein structure, cellular function "
        "and disease progression?"
    )
    ids = {i.id for i in result.items}
    assert "bio_mutation_effect_mechanism" in ids
    assert "bio_disease_progression_cancer" in ids or "bio_mutation_disease_temporal" in ids
    assert any(
        r.from_entity == "mutation" and r.to_entity == "protein folding" for r in result.relationships
    )


def test_thirukkural_water_returns_not_found(kb):
    result = retrieve_from_raw("What does Thirukkural say about water?")
    assert result.items == [] or all(i.domain != Domain.TAMIL for i in result.items)
    assert any("tamil" in nf.lower() for nf in result.not_found)


def test_biological_rhythms_vs_orbital_periods(kb):
    result = retrieve_from_raw(
        "Can biological rhythms be compared conceptually with orbital periods?"
    )
    # the conceptual bridge must exist and must NOT be labelled as evidence
    bridges = [
        r for r in result.relationships
        if r.evidence_label in {EvidenceLabel.INTERPRETATION, EvidenceLabel.ANALOGY}
    ]
    assert bridges, "expected at least one labelled conceptual bridge"
    for r in bridges:
        assert r.evidence_label != EvidenceLabel.FACT
        assert r.evidence_label != EvidenceLabel.EVIDENCE


def test_no_tamil_item_ever_claims_scientific_proof():
    result = retrieve_from_raw(
        "What does Thirukkural say about water? Does it relate to biology?"
    )
    # no cross-domain relationship may ever be FACT/EVIDENCE (loader enforces)
    kb = load_kb_fresh()
    for r in kb.relationships:
        if r.cross_domain:
            assert r.evidence_label in {EvidenceLabel.INTERPRETATION, EvidenceLabel.ANALOGY}


def test_empty_dimensions_searches_all_with_warning():
    from partb.contracts.models import DomainScore, Entity, QueryAnalysis, QueryOptions

    analysis = QueryAnalysis.model_validate(
        {
            "raw_query": "black hole",
            "normalized_query": "black hole",
            "input_type": "topic",
            "input_type_confidence": 0.9,
            "secondary_types": [],
            "intent": "explain",
            "domains": [{"domain": "astronomy", "score": 0.9}],
            "entities": [],
            "dimensions": [],
            "dimension_reasons": {},
            "options": {"max_items": 10},
            "language": "en",
            "warnings": [],
        }
    )
    result = retrieve(analysis)
    assert result.retrieval_meta["dimensions_searched"] == ["1D", "2D", "3D", "4D"]
    assert any("dimensions" in w.lower() for w in result.warnings)


def test_max_items_respected():
    result = retrieve_from_raw("black hole plasma")
    analysis_meta = result.retrieval_meta
    assert analysis_meta["items_returned"] <= 20


def load_kb_fresh():
    from partb.kb.loader import load_kb

    return load_kb()

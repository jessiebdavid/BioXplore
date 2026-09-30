"""End-to-end pipeline tests (stub backend) + API tests + validator rules."""

from __future__ import annotations

import pytest

from parta.modules.orchestrator import run_pipeline
from parta.modules.validator import validate_result
from parta.contracts.enums import Domain, Dimension, EvidenceLabel
from parta.contracts.models import (
    DomainScore,
    Entity,
    QueryAnalysis,
    QueryOptions,
    RetrievalResult,
    Source,
    Item,
)

STUB = {"RETRIEVAL_BACKEND": "stub"}


def _run(q: str, hint=None):
    import parta.config.settings as settings

    original = settings.RETRIEVAL_BACKEND
    settings.RETRIEVAL_BACKEND = "stub"
    try:
        return run_pipeline(q, dimensions_hint=hint)
    finally:
        settings.RETRIEVAL_BACKEND = original


# ---- the benchmark queries (expected type / domains / dimensions) -----------

def test_1_black_holes_topic():
    r = _run("Black holes")
    q = r["query"]
    assert q["input_type"] == "topic"
    assert [d["domain"] for d in q["domains"]] == ["astronomy"]
    # bare noun phrase: literal layer only until context/mechanism is requested
    assert set(q["dimensions"]) == {"1D"}
    assert r["answer"]["sections"], "expected content"


def test_2_plasma_oscillation_keyword():
    r = _run("Plasma oscillation")
    q = r["query"]
    assert q["input_type"] == "keyword"
    assert [d["domain"] for d in q["domains"]] == ["astronomy"]
    assert "1D" in q["dimensions"]


def test_3_kepler_concept():
    r = _run("Kepler's laws")
    q = r["query"]
    assert q["input_type"] == "concept"
    assert q["domains"][0]["domain"] == "astronomy"
    assert q["dimensions"] == ["1D"]


def test_4_sentence():
    r = _run("I want to understand how orbital periods are calculated")
    q = r["query"]
    assert q["input_type"] == "sentence"
    assert q["domains"][0]["domain"] == "astronomy"
    assert "4D" in q["dimensions"]


def test_5_question_define():
    r = _run("What is a cosmological constant?")
    q = r["query"]
    assert q["input_type"] == "question"
    assert q["intent"] == "define"
    assert q["domains"][0]["domain"] == "astronomy"
    assert q["dimensions"] == ["1D"]


def test_6_comparison():
    r = _run("Black hole vs white hole")
    q = r["query"]
    assert q["input_type"] == "comparison"
    assert q["domains"][0]["domain"] == "astronomy"
    assert set(q["dimensions"]) == {"1D", "3D"}
    sides = {e["normalized_name"]: e["side"] for e in q["entities"]}
    assert sides.get("black hole") == "A" and sides.get("white hole") == "B"


def test_7_relationship():
    r = _run("How are Kepler's laws related to orbital period?")
    q = r["query"]
    assert q["input_type"] == "relationship"
    assert q["intent"] == "find_relationship"
    assert "3D" in q["dimensions"]
    assert any(
        rel["from_entity"] == "kepler's laws" and rel["to_entity"] == "orbital period"
        for rel in r["answer"]["relationships"]
    )


def test_8_temporal():
    r = _run("How does gene expression change over time?")
    q = r["query"]
    assert q["input_type"] == "temporal"
    assert q["intent"] == "describe_change_over_time"
    assert q["domains"][0]["domain"] == "biology"
    assert "4D" in q["dimensions"]


def test_9_cross_domain():
    r = _run("Can biological rhythms be compared conceptually with orbital periods?")
    q = r["query"]
    assert q["input_type"] == "cross_domain"
    doms = {d["domain"] for d in q["domains"]}
    assert {"biology", "astronomy"} <= doms
    assert {"1D", "3D", "4D"} <= set(q["dimensions"])
    labels = {rel["evidence_label"] for rel in r["answer"]["relationships"]}
    assert "ANALOGY" in labels
    assert "FACT" not in labels


def test_10_multidimensional():
    r = _run(
        "How does a mutation affect DNA, protein structure, cellular function and disease progression?"
    )
    q = r["query"]
    assert q["input_type"] == "multidimensional"
    assert q["domains"][0]["domain"] == "biology"
    assert set(q["dimensions"]) == {"1D", "2D", "3D", "4D"}


def test_11_thirukkural_topic():
    r = _run("Thirukkural")
    q = r["query"]
    assert q["input_type"] == "topic"
    assert q["domains"][0]["domain"] == "tamil"
    assert "1D" in q["dimensions"]


def test_12_nature_in_tholkappiyam():
    r = _run("Nature in Tholkappiyam")
    q = r["query"]
    assert q["domains"][0]["domain"] == "tamil"
    assert q["input_type"] in ("concept", "topic")


def test_13_thirukkural_water():
    r = _run("What does Thirukkural say about water?")
    q = r["query"]
    assert q["domains"][0]["domain"] == "tamil"
    assert "2D" in q["dimensions"]
    # SAMPLE verse must be flagged, never presented as verified
    assert any("SAMPLE" in w for w in r["warnings"])


def test_14_edge_cases():
    # empty
    from parta.modules.input_handler import InputError

    with pytest.raises(InputError) as e:
        run_pipeline("   ")
    assert e.value.code == "EMPTY_QUERY"

    # gibberish
    r = _run("asdfghjkl zxcvbnm qwerty")
    assert r.get("error", {}).get("code") == "NO_DOMAIN_MATCH"

    # unsupported domain
    r = _run("best pizza recipe")
    assert r.get("error", {}).get("code") == "NO_DOMAIN_MATCH"

    # very long input
    with pytest.raises(InputError) as e:
        run_pipeline("black hole " * 100)
    assert e.value.code == "QUERY_TOO_LONG"


# ---- answer envelope rules --------------------------------------------------

def test_sources_deduped_and_labels_kept():
    r = _run("How are Kepler's laws related to orbital period?")
    srcs = r["sources"]
    keys = [(s["title"], s["reference"], s["verse_number"]) for s in srcs]
    assert len(keys) == len(set(keys))
    for section in r["answer"]["sections"]:
        for item in section["items"]:
            assert item["evidence_label"] in {"FACT", "EVIDENCE", "INTERPRETATION", "ANALOGY", "HYPOTHESIS"}
            assert item["source"]["title"]


def test_timings_logged():
    r = _run("Black holes")
    assert "timings_ms" in r and "retrieve" in r["timings_ms"]


# ---- Module 9 validator unit tests ------------------------------------------

def _result_with(items, rels=None):
    return RetrievalResult(
        items=items, relationships=rels or [], not_found=[], warnings=[], retrieval_meta={}
    )


def _analysis():
    return QueryAnalysis(
        raw_query="q", normalized_query="q", input_type="question",
        input_type_confidence=0.9, secondary_types=[], intent="explain",
        domains=[{"domain": "tamil", "score": 0.9}], entities=[],
        dimensions=["1D"], dimension_reasons={"1D": "r"}, options={"max_items": 20},
        language="en", warnings=[],
    )


def test_tamil_item_without_source_removed():
    bad = Item(
        id="ta_bad", dimension="1D", domain="tamil", title="t", content="verse",
        evidence_label="FACT",
        source={"title": "no text name"},
        entities=[],
    )
    cleaned, warnings = validate_result(_result_with([bad]), _analysis())
    assert cleaned.items == []
    assert any("missing verse number" in w for w in warnings)


def test_proof_claim_neutralized():
    item = Item(
        id="x1", dimension="3D", domain="astronomy", title="t",
        content="This verse proves the theory of black holes.",
        evidence_label="INTERPRETATION",
        source={"title": "essay"}, entities=[],
    )
    cleaned, warnings = validate_result(_result_with([item]), _analysis())
    assert "proves the theory" not in cleaned.items[0].content
    assert any("Neutralized" in w for w in warnings)


def test_speculative_wording_with_fact_label_flagged():
    item = Item(
        id="x2", dimension="4D", domain="astronomy", title="t",
        content="Someday black holes might evaporate completely.",
        evidence_label="FACT",
        source={"title": "essay"}, entities=[],
    )
    cleaned, warnings = validate_result(_result_with([item]), _analysis())
    assert cleaned.items == []
    assert any("flagged" in w or "flag for review" in w for w in warnings)


# ---- API --------------------------------------------------------------------

def test_api_query_and_health():
    import parta.config.settings as settings
    from fastapi.testclient import TestClient
    from parta.api.main import app

    original = settings.RETRIEVAL_BACKEND
    settings.RETRIEVAL_BACKEND = "stub"
    try:
        with TestClient(app) as client:
            resp = client.post("/query", json={"query": "Black holes"})
            assert resp.status_code == 200
            body = resp.json()
            assert body["query"]["input_type"] == "topic"

            resp = client.post("/query", json={"query": "   "})
            assert resp.status_code == 400
            assert resp.json()["error"]["code"] == "EMPTY_QUERY"

            resp = client.post("/query", json={"query": "best pizza recipe"})
            assert resp.status_code == 200
            assert resp.json()["error"]["code"] == "NO_DOMAIN_MATCH"

            health = client.get("/health").json()
            assert health["status"] == "ok"
            assert health["retrieval_backend"] == "stub"
    finally:
        settings.RETRIEVAL_BACKEND = original

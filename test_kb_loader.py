"""Knowledge-base loader tests: provenance rules are non-negotiable."""

from __future__ import annotations

from partb.contracts.enums import Dimension, Domain, EvidenceLabel
from partb.kb.loader import KBValidationError, load_kb
from partb.kb.schemas import KBEntry, KBRelationship


def test_kb_loads_without_error(kb):
    counts = kb.counts()
    assert counts["astronomy"] >= 15
    assert counts["biology"] >= 15
    assert counts["relationships"] >= 8


def test_tamil_placeholders_never_indexed(kb):
    ids = {e.id for e in kb.all_entries}
    assert not any(i.startswith("ta_placeholder") for i in ids)
    assert all(e.verified for e in kb.all_entries if e.domain == Domain.TAMIL)
    assert kb.counts()["tamil"] == 0  # nothing verified yet


def test_every_entry_has_source(kb):
    for e in kb.all_entries:
        assert e.source.title.strip()
    for r in kb.relationships:
        assert r.source.title.strip()


def test_scientific_entries_carry_reference(kb):
    for e in kb.all_entries:
        if e.domain != Domain.TAMIL:
            assert e.source.reference and e.source.reference.strip(), e.id


def test_cross_domain_labels_restricted(kb):
    for r in kb.relationships:
        if r.cross_domain:
            assert r.evidence_label in {EvidenceLabel.INTERPRETATION, EvidenceLabel.ANALOGY}, r.id
            assert r.qualifier.strip(), r.id


def test_cross_domain_fact_is_rejected():
    bad = KBRelationship(
        id="r_bad", from_entity="black hole", to_entity="impermanence",
        relation="proves", dimension=Dimension.THREE_D,
        evidence_label=EvidenceLabel.FACT,
        qualifier="should never be allowed",
        source={"title": "no real source"},
        cross_domain=True,
    )
    from partb.kb.loader import _validate_relationship

    assert _validate_relationship(bad) is not None


def test_unverified_tamil_entry_is_rejected():
    bad = KBEntry(
        id="ta_x", dimension=Dimension.ONE_D, domain=Domain.TAMIL,
        title="t", content="some verse",
        evidence_label=EvidenceLabel.FACT, verified=False,
        source={"title": "t", "text_name": "Thirukkural", "verse_number": "1", "author": "a"},
    )
    from partb.kb.loader import _validate_entry

    assert _validate_entry(bad) is not None

"""Unit tests for M9 validation."""
from app.contracts import (
    Dimension,
    Domain,
    EvidenceLabel,
    Relationship,
    RetrievalItem,
    RetrievalResult,
    Source,
)
from app.pipeline.m9_validate import (
    STANDING_TAMIL_SCIENCE_WARNING,
    validate_result,
)


def _item(**overrides) -> RetrievalItem:
    base = dict(
        dimension=Dimension.D1,
        evidence_label=EvidenceLabel.FACT,
        content="Some fact.",
        source=None,
    )
    base.update(overrides)
    return RetrievalItem.model_validate(base)


def test_drop_missing_evidence_label() -> None:
    result = RetrievalResult(
        topic="x",
        items=[_item(), _item(evidence_label=None, content="no label")],
        relationships=[],
        warnings=[],
        not_found=[],
        retrieval_meta={},
    )
    validated, warnings = validate_result(result, set())
    assert len(validated.items) == 1
    assert any("evidence_label" in w for w in warnings)


def test_tamil_item_requires_full_source() -> None:
    tamil_domains = {Domain.TAMIL}
    ok = _item(source=Source(text_name="Thirukkural", verse_number=1))
    bad_name = _item(source=Source(text_name=None, verse_number=1))
    bad_verse = _item(source=Source(text_name="SAMPLE", verse_number=None))
    no_source = _item()

    result = RetrievalResult(
        topic="x",
        items=[ok, bad_name, bad_verse, no_source],
        relationships=[],
        warnings=[],
        not_found=[],
        retrieval_meta={},
    )
    validated, warnings = validate_result(result, tamil_domains)
    assert len(validated.items) == 1
    assert len(warnings) == 3


def test_prove_wording_neutralized_with_tamil_source() -> None:
    result = RetrievalResult(
        topic="x",
        items=[
            _item(
                content="This verse proves the water cycle.",
                source=Source(text_name="Thirukkural", verse_number=33),
            )
        ],
        relationships=[],
        warnings=[],
        not_found=[],
        retrieval_meta={},
    )
    validated, warnings = validate_result(result, {Domain.TAMIL})
    assert "proves" not in validated.items[0].content
    assert any("Neutralized" in w for w in warnings)


def test_prove_wording_kept_for_science() -> None:
    result = RetrievalResult(
        topic="x",
        items=[_item(content="The experiment proves the hypothesis.")],
        relationships=[],
        warnings=[],
        not_found=[],
        retrieval_meta={},
    )
    validated, warnings = validate_result(result, {Domain.BIOLOGY})
    assert validated.items[0].content == (
        "The experiment proves the hypothesis."
    )
    assert warnings == []


def test_speculative_content_downgraded_to_hypothesis() -> None:
    result = RetrievalResult(
        topic="x",
        items=[_item(content="This might be a wormhole candidate.")],
        relationships=[],
        warnings=[],
        not_found=[],
        retrieval_meta={},
    )
    validated, _ = validate_result(result, set())
    assert validated.items[0].evidence_label == EvidenceLabel.HYPOTHESIS


def test_tamil_science_relationship_standing_warning() -> None:
    rel = Relationship(
        source_entity="Thirukkural verse",
        target_entity="water cycle",
        relation="parallels",
        description=None,
        is_conceptual=True,
    )
    result = RetrievalResult(
        topic="x",
        items=[],
        relationships=[rel],
        warnings=[],
        not_found=[],
        retrieval_meta={},
    )
    _, warnings = validate_result(result, {Domain.TAMIL, Domain.ASTRONOMY})
    assert STANDING_TAMIL_SCIENCE_WARNING in warnings


def test_empty_retrieval_not_an_error() -> None:
    result = RetrievalResult(
        topic="zzz",
        items=[],
        relationships=[],
        warnings=[],
        not_found=["zzz"],
        retrieval_meta={},
    )
    validated, _ = validate_result(result, set())
    assert validated.items == []
    assert validated.not_found == ["zzz"]

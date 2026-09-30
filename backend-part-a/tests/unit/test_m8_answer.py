"""Unit tests for M8 assembly."""
from app.contracts import (
    Dimension,
    Domain,
    EntityType,
    EvidenceLabel,
    InputType,
    Intent,
    QueryAnalysis,
    Relationship,
    RetrievalItem,
    RetrievalResult,
    Source,
)
from app.assembly.m8_answer import assemble_answer


def _analysis(dimensions: list[Dimension], input_type: InputType = InputType.TOPIC,
              entities: list | None = None) -> QueryAnalysis:
    return QueryAnalysis(
        original_query="black hole",
        normalized_query="black hole",
        input_type=input_type,
        input_type_confidence=0.9,
        secondary_types=[],
        intent=Intent.DEFINE,
        domains=[{"domain": Domain.ASTRONOMY, "score": 2.0}],
        entities=entities or [],
        dimensions=dimensions,
        dimension_reasons={"intent": "define -> 1D"},
        analysis_meta={},
    )


def _result() -> RetrievalResult:
    return RetrievalResult.model_validate({
        "topic": "black hole",
        "items": [
            {"dimension": "1D", "evidence_label": "FACT",
             "content": "Definition of a black hole.",
             "source": {"citation": "GR textbook"}},
            {"dimension": "2D", "evidence_label": "INTERPRETATION",
             "content": "Accretion disk context.",
             "source": {"citation": "X-ray observations"}},
        ],
        "relationships": [{
            "source_entity": "black hole",
            "target_entity": "spacetime",
            "relation": "curves",
            "description": None,
            "is_conceptual": False,
        }],
        "warnings": ["w1", "w1"],
        "not_found": [],
        "retrieval_meta": {},
    })


def test_only_activated_dimensions_appear() -> None:
    envelope = assemble_answer(_analysis([Dimension.D1]), _result())
    dims = [s["dimension"] for s in envelope["answer"]["sections"]]
    assert dims == ["1D"]


def test_items_keep_label_and_source() -> None:
    envelope = assemble_answer(_analysis([Dimension.D1, Dimension.D2]), _result())
    item = envelope["answer"]["sections"][0]["items"][0]
    assert item["evidence_label"] == "FACT"
    assert item["source"] == {"citation": "GR textbook"}


def test_sources_deduped() -> None:
    # _result() has two distinct sources; add a duplicate to prove dedup.
    result = _result()
    result.items.append(
        RetrievalItem.model_validate({
            "dimension": "1D", "evidence_label": "FACT",
            "content": "Duplicate source item.",
            "source": {"citation": "GR textbook"},
        })
    )
    envelope = assemble_answer(_analysis([Dimension.D1]), result)
    assert len(envelope["sources"]) == 2  # 3 items -> 2 unique sources


def test_warnings_deduped() -> None:
    envelope = assemble_answer(_analysis([Dimension.D1]), _result())
    assert envelope["warnings"] == ["w1"]


def test_not_found_populated_when_empty() -> None:
    empty = RetrievalResult(topic="x", items=[], relationships=[],
                            warnings=[], not_found=[], retrieval_meta={})
    envelope = assemble_answer(_analysis([Dimension.D1]), empty)
    assert envelope["not_found"] == ["black hole"]
    assert envelope["answer"]["sections"] == []


def test_labels_never_merged() -> None:
    envelope = assemble_answer(
        _analysis([Dimension.D1, Dimension.D2]), _result()
    )
    d1 = envelope["answer"]["sections"][0]
    d2 = envelope["answer"]["sections"][1]
    assert d1["items"][0]["evidence_label"] == "FACT"
    assert d2["items"][0]["evidence_label"] == "INTERPRETATION"


def test_comparison_table_present_for_comparison() -> None:
    from app.contracts import Entity

    entities = [
        Entity(text="black hole", normalized_name="black hole",
               domain=Domain.ASTRONOMY, entity_type=EntityType.OBJECT, side="A"),
        Entity(text="white hole", normalized_name="white hole",
               domain=Domain.ASTRONOMY, entity_type=EntityType.OBJECT, side="B"),
    ]
    analysis = _analysis([Dimension.D1, Dimension.D3],
                         InputType.COMPARISON, entities)
    envelope = assemble_answer(analysis, _result())
    assert "comparison_table" in envelope["answer"]
    table = envelope["answer"]["comparison_table"]
    assert table["A"] == "black hole"
    assert table["B"] == "white hole"

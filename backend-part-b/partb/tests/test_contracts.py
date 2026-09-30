"""Contract tests: the frozen surface Part A depends on."""

from __future__ import annotations

import pytest
from pydantic import ValidationError

from partb.contracts import (
    Dimension,
    Domain,
    Entity,
    EntityType,
    EvidenceLabel,
    InputType,
    Intent,
    Item,
    QueryAnalysis,
    QueryOptions,
    Relationship,
    RetrievalResult,
    Source,
)


def _analysis(**overrides) -> QueryAnalysis:
    base = dict(
        raw_query="black holes",
        normalized_query="black holes",
        input_type=InputType.topic,
        input_type_confidence=0.9,
        secondary_types=[],
        intent=Intent.explain,
        domains=[{"domain": "astronomy", "score": 0.95}],
        entities=[
            {
                "text": "black holes",
                "normalized_name": "black hole",
                "domain": "astronomy",
                "entity_type": "object",
                "side": None,
            }
        ],
        dimensions=["1D", "2D"],
        dimension_reasons={"1D": "literal layer", "2D": "explain question"},
        options={"max_items": 20},
        language="en",
        warnings=[],
    )
    base.update(overrides)
    return QueryAnalysis.model_validate(base)


def test_enum_values_frozen():
    assert [d.value for d in Dimension] == ["1D", "2D", "3D", "4D"]
    assert [d.value for d in Domain] == ["astronomy", "biology", "tamil"]
    assert EvidenceLabel.HYPOTHESIS.value == "HYPOTHESIS"
    assert set(EvidenceLabel) == {"FACT", "EVIDENCE", "INTERPRETATION", "ANALOGY", "HYPOTHESIS"}
    assert {i.value for i in InputType} == {
        "topic", "keyword", "concept", "sentence", "question", "comparison",
        "relationship", "temporal", "cross_domain", "multidimensional",
    }
    assert {i.value for i in Intent} == {
        "define", "explain", "compare", "find_relationship", "find_evidence",
        "retrieve_source", "describe_change_over_time", "explore_hypothesis",
        "interpret_meaning",
    }
    assert {e.value for e in EntityType} == {
        "concept", "law", "object", "process", "text_source", "theme"
    }


def test_query_options_bounds():
    assert QueryOptions().max_items == 20
    with pytest.raises(ValidationError):
        QueryOptions(max_items=0)
    with pytest.raises(ValidationError):
        QueryOptions(max_items=101)


def test_models_are_frozen():
    s = Source(title="t")
    with pytest.raises(ValidationError):
        s.title = "x"
    opts = QueryOptions()
    with pytest.raises(ValidationError):
        opts.max_items = 50
    a = _analysis()
    with pytest.raises(ValidationError):
        a.raw_query = "changed"


def test_extra_fields_forbidden():
    with pytest.raises(ValidationError):
        _analysis(surprise_field="nope")
    with pytest.raises(ValidationError):
        QueryOptions(max_items=20, unexpected=1)
    with pytest.raises(ValidationError):
        Source(title="t", extra_field=1)


def test_side_literal():
    ok = Entity(
        text="x", normalized_name="x", domain="astronomy",
        entity_type="concept", side="A",
    )
    assert ok.side == "A"
    with pytest.raises(ValidationError):
        Entity(
            text="x", normalized_name="x", domain="astronomy",
            entity_type="concept", side="C",
        )


def test_round_trip_json():
    a = _analysis()
    a2 = QueryAnalysis.model_validate_json(a.model_dump_json())
    assert a2 == a

    result = RetrievalResult(
        items=[
            Item(
                id="i1", dimension="1D", domain="astronomy", title="t", content="c",
                evidence_label="FACT", source={"title": "s"}, entities=["black hole"],
            )
        ],
        relationships=[
            Relationship(
                from_entity="a", to_entity="b", relation="causes", dimension="3D",
                evidence_label="ANALOGY", source={"title": "s"},
            )
        ],
        not_found=["thing"],
        warnings=["w"],
        retrieval_meta={"k": "v"},
    )
    r2 = RetrievalResult.model_validate_json(result.model_dump_json())
    assert r2 == result
    payload = r2.model_dump(mode="json")
    assert payload["items"][0]["source"]["title"] == "s"

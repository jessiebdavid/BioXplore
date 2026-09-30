"""Unit tests for M5 entity extraction."""
from app.pipeline.m5_entities import extract_entities


def test_simple_extraction() -> None:
    entities = extract_entities("black hole")
    assert len(entities) == 1
    e = entities[0]
    assert e.normalized_name == "black hole"
    assert e.domain.value == "astronomy"
    assert e.entity_type.value == "object"


def test_law_entity_type() -> None:
    entities = extract_entities("Kepler's laws")
    assert entities[0].entity_type.value == "law"


def test_theme_entity_type() -> None:
    entities = extract_entities("water in Thirukkural")
    types = {e.normalized_name: e.entity_type.value for e in entities}
    assert types["water"] == "theme"
    assert types["Thirukkural"] == "text_source"


def test_longest_match_wins() -> None:
    # 'gene expression' should be one entity, not 'gene' + 'expression'.
    entities = extract_entities("gene expression")
    assert [e.normalized_name for e in entities] == ["gene expression"]


def test_comparison_sides() -> None:
    entities = extract_entities("black hole vs white hole", comparison=True)
    sides = {e.normalized_name: e.side for e in entities}
    assert sides["black hole"] == "A"
    assert sides["white hole"] == "B"


def test_no_side_labels_without_comparison() -> None:
    entities = extract_entities("black hole vs white hole")
    assert all(e.side is None for e in entities)


def test_text_preserved() -> None:
    entities = extract_entities("Black holes bend spacetime")
    assert entities[0].text == "Black hole"

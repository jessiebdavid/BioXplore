"""Unit tests for StubRetriever fixtures."""
import pytest

from app.contracts import (
    Domain,
    EntityType,
    InputType,
    Intent,
    QueryAnalysis,
)
from app.retrieval.stub import StubRetriever


def _analysis(topic: str) -> QueryAnalysis:
    return QueryAnalysis(
        original_query=topic,
        normalized_query=topic,
        input_type=InputType.TOPIC,
        input_type_confidence=0.9,
        secondary_types=[],
        intent=Intent.DEFINE,
        domains=[{"domain": Domain.ASTRONOMY, "score": 1.0}],
        entities=[],
        dimensions=[],
        dimension_reasons={},
        analysis_meta={},
    )


@pytest.mark.asyncio
async def test_black_hole_fixture() -> None:
    result = await StubRetriever().retrieve(_analysis("black hole"))
    dims = {item.dimension for item in result.items}
    assert dims >= {"1D", "2D", "3D", "4D"}
    assert all(item.evidence_label is not None for item in result.items)
    assert result.relationships


@pytest.mark.asyncio
async def test_kepler_fixture() -> None:
    result = await StubRetriever().retrieve(_analysis("kepler's laws"))
    assert any(item.dimension.value == "1D" for item in result.items)
    assert result.relationships
    assert all(item.source is not None for item in result.items)


@pytest.mark.asyncio
async def test_gene_expression_fixture() -> None:
    result = await StubRetriever().retrieve(_analysis("gene expression"))
    dims = {item.dimension.value for item in result.items}
    assert {"1D", "2D", "3D", "4D"} <= dims


@pytest.mark.asyncio
async def test_thirukkural_sample_fixture() -> None:
    result = await StubRetriever().retrieve(_analysis("thirukkural"))
    assert result.warnings  # sample-data warning present
    verse_items = [
        i for i in result.items
        if i.source and i.source.text_name == "SAMPLE"
    ]
    assert verse_items
    assert all(i.source.verse_number is not None for i in verse_items)


@pytest.mark.asyncio
async def test_unknown_topic_empty_not_error() -> None:
    result = await StubRetriever().retrieve(_analysis("medieval pottery"))
    assert result.items == []
    assert result.not_found == ["medieval pottery"]
    assert result.warnings == []
    assert result.relationships == []
    assert result.retrieval_meta == {}

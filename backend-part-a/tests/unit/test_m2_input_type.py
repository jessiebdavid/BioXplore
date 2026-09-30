"""Unit tests for M2 input-type classification."""
import pytest

from app.pipeline.m2_input_type import classify_input_type
from app.llm.null_provider import NullProvider


@pytest.mark.asyncio
async def test_topic() -> None:
    itype, conf, secondary = await classify_input_type("black hole")
    assert itype.value == "topic"
    assert 0.0 <= conf <= 1.0


@pytest.mark.asyncio
async def test_keyword() -> None:
    itype, _, _ = await classify_input_type("Plasma oscillation")
    assert itype.value == "keyword"


@pytest.mark.asyncio
async def test_concept() -> None:
    itype, _, _ = await classify_input_type("Kepler's laws")
    assert itype.value == "concept"


@pytest.mark.asyncio
async def test_sentence() -> None:
    itype, _, _ = await classify_input_type(
        "I want to understand how orbital periods are calculated"
    )
    assert itype.value == "sentence"


@pytest.mark.asyncio
async def test_question_by_opener() -> None:
    itype, _, _ = await classify_input_type("What is a cosmological constant?")
    assert itype.value == "question"


@pytest.mark.asyncio
async def test_question_by_question_mark() -> None:
    itype, _, _ = await classify_input_type("gene expression?")
    assert itype.value == "question"


@pytest.mark.asyncio
async def test_comparison_strong() -> None:
    itype, conf, _ = await classify_input_type("Black hole vs white hole")
    assert itype.value == "comparison"
    assert conf >= 0.6


@pytest.mark.asyncio
async def test_relationship_strong() -> None:
    itype, _, _ = await classify_input_type(
        "How are Kepler's laws related to orbital period?"
    )
    assert itype.value == "relationship"


@pytest.mark.asyncio
async def test_temporal() -> None:
    itype, _, _ = await classify_input_type(
        "How does gene expression change over time?"
    )
    assert itype.value == "temporal"


@pytest.mark.asyncio
async def test_cross_domain() -> None:
    itype, _, _ = await classify_input_type(
        "Can biological rhythms be compared conceptually with orbital periods?"
    )
    assert itype.value == "cross_domain"


@pytest.mark.asyncio
async def test_multidimensional() -> None:
    itype, _, _ = await classify_input_type(
        "How does a mutation affect DNA, protein structure, "
        "cellular function and disease progression?"
    )
    assert itype.value == "multidimensional"


@pytest.mark.asyncio
async def test_null_provider_keeps_rule_result() -> None:
    itype, _, _ = await classify_input_type(
        "Black hole vs white hole", provider=NullProvider()
    )
    assert itype.value == "comparison"

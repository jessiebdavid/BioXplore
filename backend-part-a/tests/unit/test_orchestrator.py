"""Unit tests for the orchestrator end-to-end (stub retriever)."""
from typing import Any

import pytest

from app.contracts import QueryAnalysis, RetrievalResult
from app.pipeline.orchestrator import NoDomainMatchError, run_pipeline
from app.retrieval.factory import get_retriever


@pytest.mark.asyncio
async def test_pipeline_black_hole() -> None:
    envelope = await run_pipeline("Black holes", None, get_retriever())
    assert envelope["query"]["input_type"] == "topic"
    assert envelope["query"]["domains"][0]["domain"] == "astronomy"
    assert envelope["answer"]["sections"]
    assert "not_found" in envelope and envelope["not_found"] == []


@pytest.mark.asyncio
async def test_pipeline_stage_timings_logged() -> None:
    envelope = await run_pipeline("black hole", None, get_retriever())
    timings: dict[str, Any] = envelope["query"]["analysis_meta"]["stage_timings_ms"]
    for stage in ("m1_normalize", "m2_input_type", "m3_intent", "m4_domain",
                  "m5_entities", "m6_dimensions", "retriever_call",
                  "m9_validate", "m8_assemble"):
        assert stage in timings


@pytest.mark.asyncio
async def test_pipeline_no_domain_raises() -> None:
    with pytest.raises(NoDomainMatchError):
        await run_pipeline("best pizza recipe", None, get_retriever())


@pytest.mark.asyncio
async def test_pipeline_user_dimension_override() -> None:
    envelope = await run_pipeline(
        "black hole", {"dimensions": ["3D"]}, get_retriever()
    )
    assert envelope["query"]["dimensions"] == ["3D"]
    dims = {s["dimension"] for s in envelope["answer"]["sections"]}
    assert dims <= {"3D"}


@pytest.mark.asyncio
async def test_pipeline_unknown_topic_not_found() -> None:
    # A known-domain topic with no stub fixture still returns a (empty)
    # envelope, never an error: 'not_found' populated, sections empty.
    envelope = await run_pipeline("neutron star", None, get_retriever())
    assert envelope["answer"]["sections"] == []
    assert envelope["not_found"]


@pytest.mark.asyncio
async def test_pipeline_max_items_caps_items() -> None:
    envelope = await run_pipeline("black hole", {"max_items": 2}, get_retriever())
    total = sum(len(s["items"]) for s in envelope["answer"]["sections"])
    assert total <= 2


@pytest.mark.asyncio
async def test_pipeline_thirukkural_sample_warning() -> None:
    envelope = await run_pipeline("Thirukkural", None, get_retriever())
    assert any("SAMPLE" in w or "sample" in w for w in envelope["warnings"])

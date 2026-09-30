"""Orchestrator: runs M1..M9 (+M8) in order, timing every stage.

Stage timings and notes are logged per stage as {stage, ms, notes}. Domain
failure raises NoDomainMatchError -> API maps to NO_DOMAIN_MATCH 400.
Retrieval errors map to RETRIEVAL_FAILED / INVALID_RESULT at the API layer.
"""
import time
from typing import Any

import structlog

from app.assembly.m8_answer import assemble_answer
from app.core.context import PipelineContext
from app.core.logging import get_logger
from app.pipeline.m1_normalize import normalize_query
from app.pipeline.m2_input_type import classify_input_type
from app.pipeline.m3_intent import classify_intent
from app.pipeline.m4_domain import score_domains
from app.pipeline.m5_entities import extract_entities
from app.pipeline.m6_dimensions import apply as apply_dimensions
from app.pipeline.m9_validate import validate_result
from app.retrieval.base import Retriever
from app.retrieval.http_client import InvalidResultError, RetrievalFailedError
from app.contracts import Dimension, RetrievalResult

logger = get_logger(__name__)


class NoDomainMatchError(Exception):
    """No domain scored > 0 for the query (maps to NO_DOMAIN_MATCH)."""


class _TimedStage:
    def __init__(self, name: str, timings: dict[str, float]) -> None:
        self.name = name
        self.timings = timings

    def __enter__(self) -> "_TimedStage":
        self._start = time.perf_counter()
        return self

    def __exit__(self, exc_type: Any, exc: Any, tb: Any) -> None:
        ms = (time.perf_counter() - self._start) * 1000.0
        self.timings[self.name] = round(ms, 2)
        logger.info("stage_done", stage=self.name, ms=round(ms, 2))


async def run_pipeline(
    query: str,
    options: dict[str, Any] | None,
    retriever: Retriever,
    llm_provider: Any | None = None,
) -> dict[str, Any]:
    """Run the full pipeline and return the M8 envelope dict."""
    options = options or {}

    ctx = PipelineContext(
        original_query=query,
        options={
            "dimensions": (
                [Dimension(d) for d in options["dimensions"]]
                if options.get("dimensions") else None
            ),
            "max_items": options.get("max_items"),
        },
    )

    # M1 Normalize
    with _TimedStage("m1_normalize", ctx.stage_timings):
        ctx.normalized_query = normalize_query(query)

    # M2 Input-Type (async: LLM fallback path)
    with _TimedStage("m2_input_type", ctx.stage_timings):
        itype, conf, secondary = await classify_input_type(
            ctx.normalized_query, provider=llm_provider
        )
        ctx.input_type, ctx.input_type_confidence = itype, conf
        ctx.secondary_types = secondary

    # M3 Intent
    with _TimedStage("m3_intent", ctx.stage_timings):
        ctx.intent = classify_intent(ctx.normalized_query)

    # M4 Domains (empty -> NO_DOMAIN_MATCH; never guess)
    with _TimedStage("m4_domain", ctx.stage_timings):
        try:
            ctx.domain_scores = score_domains(ctx.normalized_query)
        except Exception:
            logger.error("m4_domain_failed")
            ctx.domain_scores = []
    if not ctx.domain_scores:
        raise NoDomainMatchError(ctx.normalized_query)

    # M5 Entities
    with _TimedStage("m5_entities", ctx.stage_timings):
        is_comparison = ctx.input_type == "comparison"
        try:
            ctx.entities = extract_entities(
                ctx.normalized_query, comparison=bool(is_comparison)
            )
        except Exception:
            logger.error("m5_entities_failed")
            ctx.entities = []

    # M6 Dimensions (user options.dimensions always overrides)
    with _TimedStage("m6_dimensions", ctx.stage_timings):
        try:
            ctx.dimensions, ctx.dimension_reasons = apply_dimensions(ctx)
        except Exception:
            logger.error("m6_dimensions_failed")
            ctx.dimensions, ctx.dimension_reasons = [Dimension.D1], {
                "fallback": "Dimension selection failed; defaulted to 1D."
            }

    # 7. Build QueryAnalysis
    analysis = ctx.to_query_analysis()

    # 8. Call Retriever
    with _TimedStage("retriever_call", ctx.stage_timings):
        result: RetrievalResult = await retriever.retrieve(analysis)

    # M9 Validate
    with _TimedStage("m9_validate", ctx.stage_timings):
        entity_domains = {e.domain for e in analysis.entities}
        result, m9_warnings = validate_result(result, entity_domains)
        ctx.warnings.extend(m9_warnings)

    # max_items: trim each section after validation (never invents data).
    max_items = options.get("max_items")
    if isinstance(max_items, int) and max_items > 0:
        result = result.model_copy(
            update={"items": result.items[:max_items]}
        )

    # M8 Assemble
    with _TimedStage("m8_assemble", ctx.stage_timings):
        envelope = assemble_answer(analysis, result)

    # The stage-timing map embedded in analysis_meta was built at step 7;
    # refresh it so it includes retriever_call/m9/m8 timings too.
    envelope["query"]["analysis_meta"]["stage_timings_ms"] = dict(ctx.stage_timings)

    logger.info("pipeline_complete",
                stages=ctx.stage_timings,
                total_ms=round(sum(ctx.stage_timings.values()), 2))
    return envelope

"""Module 7 — orchestrator.

Pipeline: normalize → classify → detect domains → extract entities →
select dimensions → build QueryAnalysis → call retrieval backend →
validate → assemble. Each step is timed and logged for debugging.
"""

from __future__ import annotations

import logging
import time

from parta.config import settings
from parta.contracts.enums import InputType
from parta.contracts.models import QueryAnalysis, QueryOptions, RetrievalResult
from parta.modules.classifier import classify
from parta.modules.dimensions import select_dimensions
from parta.modules.domains import detect_domains
from parta.modules.entities import assign_comparison_sides, extract_entities
from parta.modules.input_handler import InputError, analyze_input
from parta.modules.intent import detect_intent

logger = logging.getLogger("parta.orchestrator")


def get_backend():
    """Backend selection via the one-line config switch."""
    if settings.RETRIEVAL_BACKEND == "stub":
        from parta.retrieval.stub import StubRetrievalBackend

        return StubRetrievalBackend()
    from parta.retrieval.http_backend import HttpRetrievalBackend

    return HttpRetrievalBackend()


def run_pipeline(query: str, dimensions_hint: list[str] | None = None) -> dict:
    """Full pipeline. Returns the Module 8 answer envelope.

    Raises InputError for EMPTY_QUERY/QUERY_TOO_LONG and
    RetrievalFailed for backend failures (API layer maps to error codes).
    """
    timings: dict[str, float] = {}

    t0 = time.perf_counter()
    norm = analyze_input(query)
    timings["normalize"] = _ms(t0)

    t0 = time.perf_counter()
    entities = extract_entities(norm.normalized)
    timings["extract_entities"] = _ms(t0)

    t0 = time.perf_counter()
    input_type, conf, secondary = classify(
        norm.normalized, norm.ends_with_qmark, norm.starts_question_word, entities
    )
    timings["classify"] = _ms(t0)

    t0 = time.perf_counter()
    intent = detect_intent(input_type, norm.normalized, entities)
    timings["intent"] = _ms(t0)

    t0 = time.perf_counter()
    domain_scores, domain_warnings = detect_domains(norm.normalized, entities)
    timings["domains"] = _ms(t0)

    t0 = time.perf_counter()
    entities = assign_comparison_sides(norm.normalized, entities)
    dimensions, dim_reasons = select_dimensions(
        input_type, intent, norm.normalized, entities, dimensions_hint
    )
    timings["dimensions"] = _ms(t0)

    # Outside supported domains: contract-valid "no match" response.
    if not domain_scores:
        return _outside_scope_answer(norm, timings, domain_warnings)

    analysis = QueryAnalysis(
        raw_query=norm.raw,
        normalized_query=norm.normalized,
        input_type=input_type,
        input_type_confidence=conf,
        secondary_types=secondary,
        intent=intent,
        domains=domain_scores,
        entities=entities,
        dimensions=dimensions,
        dimension_reasons=dim_reasons,
        options=QueryOptions(max_items=settings.DEFAULT_MAX_ITEMS),
        language=norm.language,
        warnings=list(norm.notes) + domain_warnings,
    )

    t0 = time.perf_counter()
    backend = get_backend()
    result = backend.retrieve(analysis)
    timings["retrieve"] = _ms(t0)

    from parta.modules.validator import validate_result
    from parta.modules.assembler import assemble_answer

    t0 = time.perf_counter()
    cleaned, validation_warnings = validate_result(result, analysis)
    timings["validate"] = _ms(t0)

    t0 = time.perf_counter()
    answer = assemble_answer(analysis, cleaned, validation_warnings)
    timings["assemble"] = _ms(t0)
    answer["timings_ms"] = {k: round(v, 3) for k, v in timings.items()}
    logger.info("pipeline timings: %s", answer["timings_ms"])
    return answer


def _outside_scope_answer(norm, timings, warnings) -> dict:
    return {
        "query": None,
        "answer": None,
        "sources": [],
        "warnings": warnings
        + [
            "Query is outside the supported domains "
            "(astronomy, biology, classical Tamil literature)."
        ],
        "not_found": [norm.normalized],
        "error": {"code": "NO_DOMAIN_MATCH", "message": "No supported domain matched this query."},
        "timings_ms": {k: round(v, 3) for k, v in timings.items()},
    }


def _ms(t0: float) -> float:
    return (time.perf_counter() - t0) * 1000.0

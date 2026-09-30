"""M6 Dimensions: apply dimension_rules.yaml.

Precedence: explicit user options.dimensions ALWAYS overrides everything.
Otherwise: intent base dimensions + input-type additions + speculative
triggers (force 4D). dimension_reasons explains each activation.

Assumption (encoded per spec DIMENSION SELECTION RULES): cross_domain
input_type REPLACES the intent dimension set with [3D], plus [4D] only when
an analogy/hypothesis signal is present.
"""
import re
from typing import Any

import structlog

from app.contracts import Dimension, InputType, Intent
from app.core.context import PipelineContext
from app.lexicons import get_lexicon

logger = structlog.get_logger(__name__)

_ANALOGY_SIGNALS = ["analogy", "analogous", "hypothetical", "what if", "similar to"]

_DIM_ORDER = [Dimension.D1, Dimension.D2, Dimension.D3, Dimension.D4]


def _dims(values: list[str]) -> list[Dimension]:
    return [Dimension(v) for v in values]


def select_dimensions(
    intent: Intent,
    input_type: InputType,
    normalized_query: str,
    user_dimensions: list[Dimension] | None = None,
) -> tuple[list[Dimension], dict[str, str]]:
    """Return (ordered dimensions, reasons dict)."""
    lex: dict[str, Any] = get_lexicon("dimension_rules")
    reasons: dict[str, str] = {}
    low = normalized_query.casefold()

    if user_dimensions:
        dims = list(dict.fromkeys(user_dimensions))  # preserve order, dedupe
        reasons["user_override"] = lex["reasons"]["user_override"].format(
            dims=[d.value for d in dims]
        )
        logger.info("m6_result", dims=[d.value for d in dims], override=True)
        return dims, reasons

    selected: list[Dimension] = []
    speculative_hit = next(
        (t for t in lex["speculative_triggers"] if re.search(rf"\b{re.escape(t)}\b", low)),
        None,
    )

    if input_type == InputType.CROSS_DOMAIN:
        # Spec rule: cross_domain -> [3D], +4D only with analogy/hypothesis.
        selected = [Dimension.D3]
        reasons["cross_domain"] = lex["reasons"]["input_type_cross_domain"]
        if speculative_hit or any(
            re.search(rf"\b{re.escape(s)}\b", low) for s in _ANALOGY_SIGNALS
        ):
            selected.append(Dimension.D4)
            reasons["cross_domain_analogy"] = lex["reasons"][
                "input_type_cross_domain_analogy"
            ]
        dims = selected
        logger.info("m6_result", dims=[d.value for d in dims], override=False)
        return dims, reasons

    intent_dims = _dims(lex["intent_dimensions"][intent.value])
    selected.extend(intent_dims)
    reasons["intent"] = lex["reasons"]["intent"].format(
        intent=intent.value, dims=[d.value for d in intent_dims]
    )

    if input_type == InputType.MULTIDIMENSIONAL:
        # 'fill from actual clauses': the clause scan activates all four; the
        # canonical 1D..4D order is restored below.
        selected.extend(_dims(lex["input_type_additions"]["multidimensional"]))
        reasons["multidimensional"] = lex["reasons"]["input_type_multidimensional"]

    # retrieve_source + explicit meaning/context request -> +2D
    if intent == Intent.RETRIEVE_SOURCE and re.search(r"\b(meaning|context)\b", low):
        selected.extend(
            _dims(lex["input_type_additions"]["retrieve_source_intent_with_meaning"])
        )
        reasons["retrieve_source_meaning"] = lex["reasons"]["retrieve_source_meaning"]

    # 'What does <text source> say about X' asks for theme context -> +2D.
    if re.search(r"what does .+ say about", low):
        selected.append(Dimension.D2)
        reasons["say_about_theme"] = (
            "Question asks what a text source says about a theme: literary "
            "context (2D) is activated."
        )

    # '<theme> in <text source>' concept queries ask for interpretation -> +2D.
    if re.search(
        r"\b(nature|water|knowledge|body|love|virtue|duty|wealth|time|"
        r"friendship|learning|discipline)\b\s+in\b",
        low,
    ):
        selected.append(Dimension.D2)
        reasons["theme_in_source"] = (
            "Theme-within-text-source query: interpretive context (2D) is "
            "activated."
        )

    # Speculative triggers force 4D with mandatory labels.
    if speculative_hit:
        selected.append(Dimension.D4)
        reasons["speculative"] = lex["reasons"]["speculative"].format(
            term=speculative_hit
        )

    dims = list(dict.fromkeys(selected))  # dedupe preserving order
    dims.sort(key=_DIM_ORDER.index)
    logger.info("m6_result", dims=[d.value for d in dims], override=False)
    return dims, reasons


def apply(ctx: PipelineContext) -> tuple[list[Dimension], dict[str, str]]:
    """Context-aware wrapper used by the orchestrator."""
    user_dims: list[Dimension] | None = ctx.options.get("dimensions")
    return select_dimensions(
        intent=ctx.intent,  # type: ignore[arg-type]
        input_type=ctx.input_type,  # type: ignore[arg-type]
        normalized_query=ctx.normalized_query,
        user_dimensions=user_dims,
    )

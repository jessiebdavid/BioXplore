"""Module 6 — dimension selector.

Activates ONLY relevant dimensions using the frozen logic, records a reason
per activated dimension, and honours explicit user overrides from
options.dimensions_hint (e.g. "only the original verse", "give context too").
"""

from __future__ import annotations

import re

from parta.contracts.enums import Domain, Dimension, InputType, Intent
from parta.contracts.models import Entity

_HYPOTHETICAL_RE = re.compile(
    r"\b(?:what if|hypothetical|hypothetically|could there|imagine|speculat|analogy|analogous|compared conceptually)\b",
    re.IGNORECASE,
)
_MECHANISM_RE = re.compile(
    r"\b(?:mechanism|under what conditions|give context|with context|meaning of)\b",
    re.IGNORECASE,
)
# NOTE: "how does/why" alone do NOT mean mechanism was requested; Module 6 adds
# 2D for explain intent anyway, and +2D here only on explicit mechanism asks.
_TEMPORAL_WORDS_RE = re.compile(
    r"\b(?:over time|change over|changes over|evolve[sd]?|evolution|progression|period|periods)\b",
    re.IGNORECASE,
)


def _user_overrides(hint: list[str] | None) -> list[Dimension] | None:
    """Explicit user-requested dimensions override the defaults."""
    if not hint:
        return None
    try:
        dims = [Dimension(h) for h in hint if str(h).upper().replace(" ", "") in {d.value for d in Dimension}]
    except Exception:
        return None
    dims = [d for d in Dimension if d in dims]
    return dims or None


def select_dimensions(
    input_type: InputType,
    intent: Intent,
    normalized: str,
    entities: list[Entity],
    dimensions_hint: list[str] | None = None,
) -> tuple[list[Dimension], dict[Dimension, str]]:
    """Return (activated_dimensions, dimension_reasons)."""
    override = _user_overrides(dimensions_hint)
    if override:
        return override, {
            d: "explicitly requested by the user" for d in override
        }

    text = normalized.lower()
    reasons: dict[Dimension, str] = {}
    dims: list[Dimension] = []

    def _activate(d: Dimension, why: str) -> None:
        if d not in dims:
            dims.append(d)
            reasons[d] = why

    _activate(Dimension.ONE_D, "literal layer always included")

    speculative = bool(_HYPOTHETICAL_RE.search(text))
    wants_mechanism = bool(_MECHANISM_RE.search(text))
    is_tamil = any(e.domain == Domain.TAMIL for e in entities)

    if intent in (Intent.define,) and not wants_mechanism:
        pass  # 1D only
    # Bare noun phrases (topic/keyword/concept) default to the literal layer;
    # phrased explain requests (questions, sentences, temporal, multi-layer)
    # also open the context layer.
    if intent == Intent.explain and input_type in (
        InputType.question,
        InputType.sentence,
        InputType.temporal,
        InputType.cross_domain,
        InputType.multidimensional,
    ):
        _activate(Dimension.TWO_D, "phrased explain request activates context layer")
    if intent == Intent.interpret_meaning:
        _activate(Dimension.TWO_D, "interpret_meaning request activates the context layer")
    if input_type in (InputType.comparison, InputType.relationship):
        _activate(Dimension.THREE_D, "comparison/relationship query activates the relationship layer")
        if wants_mechanism:
            _activate(Dimension.TWO_D, "mechanism/context requested alongside the comparison")
    temporal_wording = bool(_TEMPORAL_WORDS_RE.search(text))
    if (
        input_type in (InputType.temporal,)
        or intent == Intent.describe_change_over_time
        or temporal_wording
    ):
        _activate(
            Dimension.FOUR_D,
            "temporal language present (change over time / periods / progression)",
        )
        if wants_mechanism:
            _activate(Dimension.TWO_D, "mechanism requested alongside temporal framing")
    if input_type == InputType.cross_domain:
        _activate(Dimension.THREE_D, "cross-domain query requires the relationship layer")
        if speculative or intent == Intent.explore_hypothesis:
            _activate(Dimension.FOUR_D, "analogy/hypothesis framing activates the speculative layer")
    if input_type == InputType.multidimensional:
        for d, why in (
            (Dimension.ONE_D, "multidimensional query mentions the literal layer"),
            (Dimension.TWO_D, "multidimensional query mentions mechanisms/context"),
            (Dimension.THREE_D, "multidimensional query mentions entity relationships"),
            (Dimension.FOUR_D, "multidimensional query mentions progression over time"),
        ):
            _activate(d, why)
    if is_tamil and intent == Intent.retrieve_source:
        _activate(Dimension.ONE_D, "verse lookup is literal by definition")
        if wants_mechanism:
            _activate(Dimension.TWO_D, "meaning/context requested with the verse")

    if speculative:
        _activate(Dimension.FOUR_D, "speculative/analogy framing present in the query")

    return dims, reasons

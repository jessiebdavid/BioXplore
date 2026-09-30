"""M2 Input-Type Classifier: weighted rules from input_type_patterns.yaml.

Scoring: raw(kind, text) in [0,1] * weight, normalized by max weight (100).
Terms are word-boundary regex fragments (trusted config). Raw-score policy
(assumption, tuned to the spec's test table):
- contains_any: 0.5 base + 0.25 per strong_terms hit + 0.1 per plain-term
  hit (capped at 1.0). Strong = explicit phrasing ('related to', 'vs').
- question: 0.9 interrogative opener, 0.75 for trailing '?' alone.
- token_count (topic): decays from 1.0 as token count grows.
- sentence_intent: flat 1.0 on first-person openers.
- multi_domain_signal: flat 1.0 when conjunction/enumeration threshold met.

Top-two scores within ambiguity_margin -> secondary_types + LLM fallback
(NullProvider returns None -> rule result stands).
"""
import re
from typing import Any

import structlog

from app.contracts import InputType
from app.lexicons import get_lexicon
from app.llm.base import LLMProvider
from app.utils.text import tokenize

logger = structlog.get_logger(__name__)


def _hits(low: str, terms: list[str]) -> int:
    """Count matching word-boundary terms."""
    return sum(1 for t in terms if re.search(rf"\b{t}\b", low, re.IGNORECASE))


def _raw_score(rule: dict[str, Any], text: str) -> float:
    """Kind-specific raw score in [0, 1] for one rule against the query text."""
    kind = rule["kind"]
    params: dict[str, Any] = rule.get("params", {})
    low = text.casefold()

    if kind == "contains_any":
        strong = _hits(low, params.get("strong_terms", []))
        weak = _hits(low, params.get("terms", []))
        total = 0.5 + 0.25 * strong + 0.1 * weak
        return min(1.0, total) if (strong + weak) > 0 else 0.0

    if kind == "question":
        starts: list[str] = params.get("starts_with", [])
        if any(low.startswith(s.casefold()) for s in starts):
            return 0.9
        if low.endswith(params.get("ends_with", ["?"])[0]):
            return 0.75
        return 0.0

    if kind == "token_count":
        n = len(tokenize(text))
        lo = params.get("min_tokens", 1)
        hi = params.get("max_tokens", 4)
        if lo <= n <= hi:
            return max(0.0, 1.0 - (n - lo) / max(1, hi - lo + 1))
        return 0.0

    if kind == "sentence_intent":
        starts: list[str] = params.get("starts_with", [])
        return 1.0 if any(low.startswith(s.casefold()) for s in starts) else 0.0

    if kind == "multi_domain_signal":
        required = params.get("multi_domain_terms_required", 3)
        conjunctions: list[str] = params.get("conjunctions", [])
        enum_signals: list[str] = params.get("enumeration_signals", [])
        conj_hits = sum(1 for c in conjunctions if f" {c} " in f" {low} ")
        enum_hits = sum(low.count(s) for s in enum_signals)
        if conj_hits + enum_hits >= required:
            return 1.0
        cross_terms: list[str] = params.get("cross_terms", [])
        if cross_terms and any(
            re.search(rf"\b{t}\b", low, re.IGNORECASE) for t in cross_terms
        ):
            return 1.0
        return 0.0

    logger.warning("unknown_rule_kind", kind=kind, rule=rule.get("id"))
    return 0.0


async def classify_input_type(
    text: str,
    provider: LLMProvider | None = None,
) -> tuple[InputType, float, list[InputType]]:
    """Return (input_type, confidence 0..1, secondary_types)."""
    lex = get_lexicon("input_type_patterns")
    margin: float = lex["ambiguity_margin"]
    rules: list[dict[str, Any]] = lex["rules"]

    max_weight = max(r.get("weight", 1) for r in rules) or 1
    scored: list[tuple[float, InputType, str]] = [
        (
            (_raw_score(rule, text) * rule.get("weight", 1)) / max_weight,
            InputType(rule["input_type"]),
            rule["id"],
        )
        for rule in rules
    ]

    scored.sort(key=lambda t: t[0], reverse=True)
    top_score, top_type, top_rule = scored[0]
    second_score, second_type, _ = scored[1] if len(scored) > 1 else (0.0, None, "")

    secondary: list[InputType] = []
    if (
        second_type is not None
        and (top_score - second_score) <= margin
        and second_score > 0
    ):
        secondary = [second_type]

    # LLM fallback ONLY on ambiguity; NullProvider returns None -> keep rules.
    if provider is not None and secondary:
        chosen = await provider.disambiguate_input_type(
            text, [top_type, *secondary]
        )
        if chosen is not None:
            try:
                top_type = InputType(chosen)
            except ValueError:
                logger.warning("llm_invalid_input_type", value=chosen)

    logger.info(
        "m2_result",
        input_type=top_type.value,
        confidence=round(top_score, 3),
        rule=top_rule,
        secondary=[t.value for t in secondary],
    )
    return top_type, min(1.0, max(0.0, top_score)), secondary

"""Local fallback analyzer (Part B-internal, for standalone testing/demo).

Part A owns real classification; this module exists only so the backend can
be exercised without Part A (tests, demos). It builds a valid QueryAnalysis
from a raw query using a gazetteer derived from the KB entries themselves.
"""

from __future__ import annotations

import re

from partb.contracts.enums import Dimension, Domain, EntityType, InputType, Intent
from partb.contracts.models import (
    DomainScore,
    Entity,
    QueryAnalysis,
    QueryOptions,
)
from partb.kb.loader import load_kb

_WORD_RE = re.compile(r"[a-z']+")

# dimension activation rules: (trigger words in normalized query) -> dimension
_DIMENSION_RULES: list[tuple[Dimension, tuple[str, ...]]] = [
    (Dimension.FOUR_D, ("over time", "change", "progression", "evolution", "period", "periods", "future", "hypothetical", "compared conceptually", "analogy")),
    (Dimension.THREE_D, ("related", "relationship", "between", "affect", "causes", "effect", "link", "versus", " vs ", "compare", "compared")),
    (Dimension.TWO_D, ("how", "why", "mechanism", "context", "meaning", "interpretation")),
    (Dimension.ONE_D, ()),  # always activated: literal layer is the foundation
]


def _normalize(q: str) -> str:
    return " ".join(_WORD_RE.findall(q.lower()))


def _detect_input_type(norm: str, raw: str) -> tuple[InputType, float, list[InputType]]:
    secondary: list[InputType] = []
    is_question = raw.strip().endswith("?") or norm.split() and norm.split()[0] in {
        "how", "what", "why", "when", "can", "does", "do", "is", "are"
    }
    cross_markers = (" vs ", "versus", "compared", "between")
    temporal_markers = ("over time", "change", "progression", "evolution", "period")

    if " vs " in f" {norm} " or " versus " in f" {norm} ":
        return InputType.comparison, 0.9, secondary
    if any(m in norm for m in ("compared conceptually", "cross domain", "cross-domain")) or "compare" in norm and len(norm.split()) > 3:
        secondary.append(InputType.comparison)
        return InputType.cross_domain, 0.75, secondary
    if any(m in norm for m in temporal_markers) and is_question:
        secondary.append(InputType.question)
        return InputType.temporal, 0.8, secondary
    if any(m in norm for m in temporal_markers):
        return InputType.temporal, 0.7, secondary
    if is_question:
        return InputType.question, 0.7, secondary
    if any(m in f" {norm} " for m in cross_markers):
        return InputType.relationship, 0.6, secondary
    if len(norm.split()) <= 3:
        return InputType.topic, 0.85, secondary
    return InputType.concept, 0.6, secondary


def _detect_intent(input_type: InputType, norm: str) -> Intent:
    if "compare" in norm or " vs " in norm or "versus" in norm:
        return Intent.compare
    if "related" in norm or "relationship" in norm or "between" in norm or "affect" in norm:
        return Intent.find_relationship
    if "over time" in norm or "progression" in norm or "change over" in norm:
        return Intent.describe_change_over_time
    if norm.startswith(("what is", "define", "definition of")):
        return Intent.define
    if "meaning" in norm or "say about" in norm or "interpret" in norm:
        return Intent.interpret_meaning
    if input_type == InputType.cross_domain:
        return Intent.find_relationship
    if input_type == InputType.temporal:
        return Intent.describe_change_over_time
    return Intent.explain


def _detect_domains(norm: str, kb_counts: dict[str, int]) -> list[DomainScore]:
    scores: dict[Domain, float] = {}
    for domain in Domain:
        text_hits = 0.0
        for entry in load_kb().entries.get(domain, ()):
            alias_terms = _normalize(" ".join(entry.aliases + entry.keywords))
            if not alias_terms:
                continue
            overlap = len(set(alias_terms.split()) & set(norm.split()))
            text_hits += overlap
        if text_hits:
            scores[domain] = min(1.0, 0.2 + 0.1 * text_hits)
    # crude Tamil boost for classical-text names
    if any(t in norm for t in ("thirukkural", "tholkappiyam", "thirumandiram", "purananuru", "avvaiyar", "kural", "tamil")):
        scores[Domain.TAMIL] = max(scores.get(Domain.TAMIL, 0.0), 0.9)
    if not scores:
        return []
    ranked = sorted(scores.items(), key=lambda kv: -kv[1])
    return [DomainScore(domain=d, score=round(s, 2)) for d, s in ranked]


def _detect_entities(norm: str) -> list[Entity]:
    kb = load_kb()
    entities: list[Entity] = []
    seen: set[str] = set()
    for domain in Domain:
        for entry in kb.entries.get(domain, ()):
            for alias in entry.aliases + [entry.title]:
                alias_norm = _normalize(alias)
                if alias_norm and alias_norm in norm and alias_norm not in seen:
                    seen.add(alias_norm)
                    etype = EntityType.concept
                    if domain == Domain.TAMIL:
                        etype = EntityType.text_source
                    elif "law" in alias_norm:
                        etype = EntityType.law
                    elif any(w in alias_norm for w in ("expression", "folding", "progression", "oscillation")):
                        etype = EntityType.process
                    entities.append(
                        Entity(
                            text=alias,
                            normalized_name=alias_norm,
                            domain=domain,
                            entity_type=etype,
                            side=None,
                        )
                    )
    return entities


def _select_dimensions(input_type: InputType, norm: str, intent: Intent) -> list[Dimension]:
    activated: list[Dimension] = [Dimension.ONE_D]
    text = f" {norm} "
    for dim, triggers in _DIMENSION_RULES:
        if dim == Dimension.ONE_D:
            continue
        if any(t in text for t in triggers):
            activated.append(dim)

    # intent-driven activation (Part A would supply richer signals locally)
    if intent == Intent.explain and Dimension.TWO_D not in activated:
        activated.append(Dimension.TWO_D)
    if intent == Intent.describe_change_over_time and Dimension.FOUR_D not in activated:
        activated.append(Dimension.FOUR_D)
    if intent == Intent.interpret_meaning and Dimension.TWO_D not in activated:
        activated.append(Dimension.TWO_D)
    if intent == Intent.find_relationship and Dimension.THREE_D not in activated:
        activated.append(Dimension.THREE_D)
    if intent == Intent.explore_hypothesis and Dimension.FOUR_D not in activated:
        activated.append(Dimension.FOUR_D)
    if input_type == InputType.cross_domain:
        for d in (Dimension.TWO_D, Dimension.THREE_D):
            if d not in activated:
                activated.append(d)

    return activated


def _dimension_reasons(activated: list[Dimension], norm: str) -> dict[Dimension, str]:
    reasons: dict[Dimension, str] = {}
    for dim in activated:
        if dim == Dimension.ONE_D:
            reasons[dim] = "literal layer always included for definitions and source text"
        elif dim == Dimension.TWO_D:
            reasons[dim] = "mechanism/context question words present"
        elif dim == Dimension.THREE_D:
            reasons[dim] = "relationship/comparison language present"
        elif dim == Dimension.FOUR_D:
            reasons[dim] = "temporal/hypothetical language present"
    return reasons


def _detect_language(raw: str) -> str:
    tamil_range = re.compile(r"[\u0b80-\u0bff]")
    has_tamil = bool(tamil_range.search(raw))
    has_latin = bool(re.search(r"[a-zA-Z]", raw))
    if has_tamil and has_latin:
        return "mixed"
    if has_tamil:
        return "ta"
    return "en"


def analyze_locally(raw_query: str) -> QueryAnalysis:
    raw = raw_query.strip()
    norm = _normalize(raw)
    input_type, conf, secondary = _detect_input_type(norm, raw)
    intent = _detect_intent(input_type, norm)
    domains = _detect_domains(norm, load_kb().counts())
    entities = _detect_entities(norm)
    dimensions = _select_dimensions(input_type, norm, intent)

    warnings: list[str] = []
    if not domains:
        warnings.append("Local fallback: no domain detected; retrieval will search all domains.")
    if not entities:
        warnings.append("Local fallback: no entities matched the knowledge-base gazetteer.")

    return QueryAnalysis(
        raw_query=raw,
        normalized_query=norm,
        input_type=input_type,
        input_type_confidence=conf,
        secondary_types=secondary,
        intent=intent,
        domains=domains,
        entities=entities,
        dimensions=dimensions,
        dimension_reasons=_dimension_reasons(dimensions, norm),
        options=QueryOptions(),
        language=_detect_language(raw),
        warnings=warnings,
    )

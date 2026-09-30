"""Module 2 — input-type classifier.

Ordered rule cascade, most specific first. All applicable marker sets are
computed up front; the cascade picks the primary type and the rest go to
secondary_types (in cascade order).
"""

from __future__ import annotations

import re

from parta.contracts.enums import EntityType, InputType
from parta.contracts.models import Entity

_COMPARISON_RE = re.compile(
    r"\b(?:vs\.?|versus|compared (?:to|with)|comparison|difference between|differ(?:s)? (?:from|with|between)?)\b",
    re.IGNORECASE,
)
_RELATIONSHIP_RE = re.compile(
    r"\b(?:related to|relationship between|relation between|link between|links? to|affects?)\b",
    re.IGNORECASE,
)
_TEMPORAL_RE = re.compile(
    r"\b(?:over time|changes|changed|changing|change over|evolve[sd]?|evolution|progression|progresses?|period|periods|future)\b",
    re.IGNORECASE,
)
_WANT_RE = re.compile(
    r"\b(?:i want to|i would like to|i need to|help me)\b", re.IGNORECASE
)
_MULTIDIM_RE = re.compile(
    r"\b(?:dna|rna|protein structure|protein folding|cellular function|disease progression|gene expression|mutation)\b",
    re.IGNORECASE,
)
_QUESTION_STARTERS = {
    "what", "why", "how", "when", "where", "who", "can", "does", "do",
    "is", "are", "explain", "define", "describe",
}


def classify(
    normalized: str,
    ends_with_qmark: bool,
    starts_question_word: bool,
    entities: list[Entity],
) -> tuple[InputType, float, list[InputType]]:
    """Return (input_type, confidence, secondary_types)."""
    text = normalized.lower()

    is_comparison = bool(_COMPARISON_RE.search(text))
    is_relationship = bool(_RELATIONSHIP_RE.search(text))
    is_temporal = bool(_TEMPORAL_RE.search(text))
    is_question = ends_with_qmark or starts_question_word
    is_want = bool(_WANT_RE.search(text))
    n_layers = len(set(_MULTIDIM_RE.findall(text)))
    ent_domains = {e.domain for e in entities}
    is_cross_domain = len(ent_domains) >= 2

    flags: list[InputType] = []
    if is_comparison:
        flags.append(InputType.comparison)
    if n_layers >= 3:
        flags.append(InputType.multidimensional)
    if is_relationship:
        flags.append(InputType.relationship)
    if is_temporal:
        flags.append(InputType.temporal)
    if is_cross_domain:
        flags.append(InputType.cross_domain)
    if is_want:
        flags.append(InputType.sentence)
    if is_question:
        flags.append(InputType.question)

    cascade = [
        InputType.comparison,
        InputType.multidimensional,
        InputType.cross_domain,
        InputType.relationship,
        InputType.sentence,
        InputType.temporal,
        InputType.question,
    ]
    primary = next((t for t in cascade if t in flags), None)

    if primary is not None:
        secondary = [t for t in cascade if t in flags and t != primary]
        conf = {
            InputType.comparison: 0.95,
            InputType.multidimensional: min(0.75 + 0.05 * (n_layers - 3), 0.95),
            InputType.relationship: 0.9,
            InputType.temporal: 0.85 if is_question else 0.75,
            InputType.cross_domain: 0.85,
            InputType.sentence: 0.9,
            InputType.question: 0.8,
        }[primary]
        return primary, conf, secondary

    # Noun-phrase rules: no behavioural markers.
    words = text.split()
    entity_types = {e.entity_type for e in entities}
    if EntityType.law in entity_types:
        return InputType.concept, 0.85, []
    if EntityType.theme in entity_types:
        return InputType.concept, 0.8, []
    if EntityType.text_source in entity_types:
        return InputType.topic, 0.8, []
    if EntityType.object in entity_types:
        return InputType.topic, 0.8, []
    if EntityType.process in entity_types:
        return InputType.keyword, 0.8, []
    if len(words) <= 3:
        return InputType.keyword, 0.7, []
    return InputType.topic, 0.7, []

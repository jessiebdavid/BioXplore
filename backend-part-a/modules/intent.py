"""Module 3 — intent detection."""

from __future__ import annotations

import re

from parta.contracts.enums import Domain, InputType, Intent
from parta.contracts.models import Entity

_DEFINE_RE = re.compile(r"\b(?:what is|what are|define|definition of)\b", re.IGNORECASE)
_MEANING_RE = re.compile(
    r"\b(?:meaning|interpret|interpretation|say about|significance|symbolism)\b",
    re.IGNORECASE,
)
_MECHANISM_RE = re.compile(
    r"\b(?:how does|how do|mechanism|why|under what conditions|how are)\b",
    re.IGNORECASE,
)
_COMPARE_RE = re.compile(
    r"\b(?:vs\.?|versus|compare|difference between)\b", re.IGNORECASE
)
_RETRIEVE_SOURCE_RE = re.compile(
    r"\b(?:which verse|verse number|original verse|source of the verse|quote the verse)\b",
    re.IGNORECASE,
)
_HYPOTHESIS_RE = re.compile(
    r"\b(?:what if|hypothetically|hypothetical|could there be|imagine|speculate|analogy for)\b",
    re.IGNORECASE,
)


def detect_intent(input_type: InputType, normalized: str, entities: list[Entity]) -> Intent:
    text = normalized.lower()

    if _RETRIEVE_SOURCE_RE.search(text):
        return Intent.retrieve_source
    if _HYPOTHESIS_RE.search(text):
        return Intent.explore_hypothesis
    if _COMPARE_RE.search(text):
        return Intent.compare
    if _DEFINE_RE.search(text):
        return Intent.define
    if input_type == InputType.temporal:
        return Intent.describe_change_over_time
    if _MEANING_RE.search(text):
        return Intent.interpret_meaning
    if input_type == InputType.relationship:
        return Intent.find_relationship
    if input_type == InputType.cross_domain:
        return Intent.find_relationship
    if input_type == InputType.comparison:
        return Intent.compare
    if input_type == InputType.multidimensional:
        return Intent.explain
    if _MECHANISM_RE.search(text) and any(
        e.domain != Domain.TAMIL for e in entities
    ):
        return Intent.explain
    if input_type == InputType.question:
        return Intent.explain
    if input_type in (InputType.topic, InputType.keyword, InputType.concept):
        return Intent.explain
    return Intent.explain

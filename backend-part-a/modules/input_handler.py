"""Module 1 — input handling.

Normalize free text (trim, casing, punctuation, Tamil Unicode), reject
empty/over-long input with typed errors.

Deliberately NOT rewritten here: spelling variants and typos of known terms.
Those are resolved at extraction time (modules/matching.py), where a fuzzy
n-gram hit becomes a canonical entity — the user's own wording is preserved
in normalized_query.
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass, field

from parta.config import settings


class InputError(Exception):
    """Typed input error; `code` maps to the API error format."""

    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message
        super().__init__(message)


@dataclass
class NormalizedInput:
    raw: str
    normalized: str
    words: list[str]
    ends_with_qmark: bool
    starts_question_word: bool
    language: str = "en"
    notes: list[str] = field(default_factory=list)


_TAMIL_RE = re.compile(r"[\u0b80-\u0bff]")
_QUESTION_STARTERS = {
    "what", "why", "how", "when", "where", "who", "can", "does", "do",
    "is", "are", "explain", "define", "describe",
}


def _clean(raw: str) -> str:
    text = unicodedata.normalize("NFC", raw)
    text = text.strip()
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"([!?.,;:])\1+", r"\1", text)  # collapse punctuation runs
    text = re.sub(r"\s+([?!.,;:])", r"\1", text)  # no space before punctuation
    return text


def analyze_input(raw: str) -> NormalizedInput:
    if not isinstance(raw, str):
        raise InputError("EMPTY_QUERY", "Query must be a non-empty string.")
    text = _clean(raw)
    if len(text) < settings.MIN_QUERY_LEN:
        raise InputError("EMPTY_QUERY", "Query is empty after normalization.")
    if len(text) > settings.MAX_QUERY_LEN:
        raise InputError(
            "QUERY_TOO_LONG",
            f"Query exceeds the maximum length of {settings.MAX_QUERY_LEN} characters.",
        )

    words = text.split()
    first = words[0].strip("?!.,;:") if words else ""
    return NormalizedInput(
        raw=raw,
        normalized=text,
        words=words,
        ends_with_qmark=text.endswith("?"),
        starts_question_word=first.lower() in _QUESTION_STARTERS,
        language=detect_language(text),
    )


def detect_language(text: str) -> str:
    has_tamil = bool(_TAMIL_RE.search(text))
    has_latin = bool(re.search(r"[A-Za-z]", text))
    if has_tamil and has_latin:
        return "mixed"
    if has_tamil:
        return "ta"
    return "en"

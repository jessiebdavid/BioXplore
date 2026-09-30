"""Text helpers: normalization, case-insensitive matching, tokenization.

Term matching uses word-boundary regex (\bterm\b, terms are trusted config and
may contain regex metachars like '?'), so 'periods' does NOT match 'period'
but 'laws' matches the regex term "laws?'s?".
"""
import re
import unicodedata

_WHITESPACE_RE = re.compile(r"\s+")


def nfc_normalize(text: str) -> str:
    """Return NFC-normalized text."""
    return unicodedata.normalize("NFC", text)


def collapse_whitespace(text: str) -> str:
    """Collapse all whitespace runs (incl. newlines/tabs) to single spaces."""
    return _WHITESPACE_RE.sub(" ", text).strip()


def strip_trailing_punctuation(text: str) -> str:
    """Strip trailing punctuation (keeps '?', which question rules need)."""
    return text.rstrip(" \t.,;:!\"'\u201d\u2019")


def lowercase(text: str) -> str:
    """Lowercase wrapper (casefold for robust matching)."""
    return text.casefold()


def tokenize(text: str) -> list[str]:
    """Simple punctuation-aware tokenizer."""
    return re.findall(r"[\w'-]+", text.casefold(), re.UNICODE)


def term_matches(text: str, term: str) -> bool:
    """Word-boundary regex match of a (regex-capable, trusted) term."""
    return re.search(rf"\b{term}\b", text, re.IGNORECASE) is not None


def contains_any(text: str, terms: list[str]) -> bool:
    """True if any word-boundary term matches the text."""
    return any(term_matches(text, t) for t in terms)


def count_token_occurrences(haystack: str, term: str) -> int:
    """Count whole-token occurrences of a literal term (case-insensitive)."""
    return len(re.findall(rf"\b{re.escape(term.casefold())}\b",
                          haystack.casefold(), re.UNICODE))

"""Unit tests for M1 normalization."""
from app.pipeline.m1_normalize import normalize_query


def test_exact_alias_canonicalized() -> None:
    assert normalize_query("blackhole") == "black hole"


def test_plural_alias_canonicalized() -> None:
    assert normalize_query("Black holes") == "black hole"


def test_multiword_alias_canonicalized() -> None:
    assert normalize_query("the laws of kepler") == "the Kepler's laws"


def test_dna_expansion() -> None:
    assert normalize_query("deoxyribonucleic acid structure") == "DNA structure"


def test_sentence_not_fuzzy_mapped() -> None:
    q = "How does gene expression change over time?"
    # '?' is preserved so the question rules can still see it.
    assert normalize_query(q) == "How does gene expression change over time?"


def test_tamil_script_transliterated() -> None:
    out = normalize_query("\u0ba4\u0bbf\u0bb0\u0bc1\u0b95\u0bcd\u0b95\u0bc1\u0bb1\u0bb3\u0bcd")
    assert out == "Thirukkural"


def test_whitespace_and_trailing_punctuation() -> None:
    assert normalize_query("  black   holes...  ") == "black hole"


def test_unknown_text_unchanged() -> None:
    assert normalize_query("asdkjfhalskdjfh") == "asdkjfhalskdjfh"


def test_orbital_periods_alias() -> None:
    assert normalize_query("orbital periods") == "orbital period"

"""Unit tests for text, tamil, and dedup utils."""
from app.utils.dedup import dedupe_by_key, dedupe_strings
from app.utils.tamil import contains_tamil_script, tamil_char_ratio
from app.utils.text import (
    collapse_whitespace,
    contains_any,
    count_token_occurrences,
    lowercase,
    nfc_normalize,
    strip_trailing_punctuation,
    tokenize,
)


def test_nfc_normalize_is_stable() -> None:
    s = "caf\u00e9"  # precomposed
    assert nfc_normalize(s) == s


def test_collapse_whitespace() -> None:
    assert collapse_whitespace("  a \n\t b  ") == "a b"


def test_strip_trailing_punctuation_keeps_question_mark() -> None:
    assert strip_trailing_punctuation("what is this?") == "what is this?"
    assert strip_trailing_punctuation("word.") == "word"
    assert strip_trailing_punctuation("word...") == "word"


def test_tokenize_basic() -> None:
    assert tokenize("Black holes and DNA!") == ["black", "holes", "and", "dna"]


def test_contains_any_word_boundary() -> None:
    # 'period' must NOT match 'periods' (word-boundary matching).
    assert not contains_any("orbital periods are calculated", ["period"])
    assert contains_any("orbital period is short", ["period"])


def test_lowercase_casefold() -> None:
    assert lowercase("DNA") == "dna"


def test_count_token_occurrences() -> None:
    assert count_token_occurrences("hole hole blackhole", "hole") == 2


def test_contains_tamil_script() -> None:
    assert contains_tamil_script("\u0ba4\u0bbf\u0bb0\u0bc1\u0b95\u0bcd\u0b95\u0bc1\u0bb1\u0bb3\u0bcd")
    assert not contains_tamil_script("Thirukkural")


def test_tamil_char_ratio_bounds() -> None:
    assert tamil_char_ratio("hello") == 0.0
    assert 0.0 < tamil_char_ratio("abc \u0ba4\u0bbf") <= 1.0


def test_dedupe_strings_preserves_order() -> None:
    assert dedupe_strings(["b", "a", "b", "c", "a"]) == ["b", "a", "c"]


def test_dedupe_by_key() -> None:
    items = [{"k": 1, "v": "x"}, {"k": 1, "v": "y"}, {"k": 2, "v": "z"}]
    assert dedupe_by_key(items, key_fn=lambda i: i["k"]) == [
        {"k": 1, "v": "x"},
        {"k": 2, "v": "z"},
    ]

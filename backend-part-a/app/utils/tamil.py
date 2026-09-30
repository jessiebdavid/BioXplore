"""Tamil-script utilities: detection, script alias transliteration, verse checks.

Assumption: full romanization of arbitrary Tamil is out of scope for Part A;
we transliterate the known script aliases from synonyms.yaml (handled by the
canonicalizer) and provide detection helpers used by M1 and M5.
"""
import re

# Unicode block range for Tamil (U+0B80–U+0BFF)
_TAMIL_RE = re.compile(r"[\u0b80-\u0bff]")


def contains_tamil_script(text: str) -> bool:
    """True if the text contains any Tamil-script codepoint."""
    return bool(_TAMIL_RE.search(text))


def tamil_char_ratio(text: str) -> float:
    """Ratio of Tamil characters to all alphabetic characters (0.0 if none)."""
    alpha = [c for c in text if c.isalpha()]
    if not alpha:
        return 0.0
    tamil = [c for c in alpha if _TAMIL_RE.match(c)]
    return len(tamil) / len(alpha)

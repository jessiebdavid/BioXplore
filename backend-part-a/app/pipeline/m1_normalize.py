"""M1 Normalize: NFC -> whitespace collapse -> trailing punctuation strip ->
Tamil script-alias transliteration -> synonym canonicalization (exact match
first, then rapidfuzz at threshold 0.85, alias-length-bounded).

Canonicalization replaces whole phrases at word boundaries only: alias spans
are rewritten longest-first, so 'blackhole' -> 'black hole' and
'the laws of kepler' -> 'the Kepler's laws' without touching other words.
"""
import re
from functools import lru_cache

from app.contracts import Domain
from app.lexicons import get_lexicon
from app.utils import tamil as tamil_utils
from app.utils.text import lowercase, nfc_normalize, collapse_whitespace, strip_trailing_punctuation
from rapidfuzz import fuzz

FUZZY_THRESHOLD = 0.85


@lru_cache(maxsize=1)
def _alias_map() -> dict[str, str]:
    """alias -> canonical, built once from synonyms.yaml (all lowercased)."""
    canonical_map: dict[str, list[str]] = get_lexicon("synonyms")["canonical_map"]
    out: dict[str, str] = {}
    for canonical, aliases in canonical_map.items():
        out[canonical.casefold()] = canonical
        for alias in aliases:
            out[alias.casefold()] = canonical
    return out


@lru_cache(maxsize=1)
def _alias_patterns() -> list[tuple[str, str]]:
    """(escaped_lower_alias, canonical) sorted longest-first for replacement."""
    return sorted(
        ((re.escape(a), c) for a, c in _alias_map().items()),
        key=lambda pair: len(pair[0]),
        reverse=True,
    )


@lru_cache(maxsize=1)
def _domain_terms() -> dict[str, list[str]]:
    """Domain -> searchable term list (lowercased)."""
    astro = get_lexicon("astronomy")
    bio = get_lexicon("biology")
    tam = get_lexicon("tamil")
    return {
        Domain.ASTRONOMY.value: [t.casefold() for t in astro["terms"]],
        Domain.BIOLOGY.value: [t.casefold() for t in bio["terms"]],
        Domain.TAMIL.value: [t.casefold() for t in tam["text_sources"]]
        + [t.casefold() for t in tam["themes"]],
    }


def _canonicalize_phrase(phrase: str) -> str:
    """Canonicalize one phrase via exact match, then fuzzy >= 0.85.

    Fuzzy acceptance is bounded to phrases of at most 5 tokens so full
    sentences are never rewritten into a lexicon term.
    """
    low = lowercase(phrase.strip())
    if not low:
        return phrase
    alias_map = _alias_map()

    if low in alias_map:
        return alias_map[low]

    if len(phrase.split()) > 5:
        return phrase

    best_canon, best_score = None, 0.0
    for alias, canonical in alias_map.items():
        score = fuzz.token_set_ratio(low, alias)
        if score > best_score:
            best_score, best_canon = score, canonical
    if best_canon is not None and best_score >= FUZZY_THRESHOLD * 100:
        return best_canon
    return phrase


def _has_domain_term(text: str) -> bool:
    """True if any domain term appears with word boundaries."""
    low = lowercase(text)
    return any(
        f" {t} " in f" {low} "
        for terms in _domain_terms().values()
        for t in terms
    )


def normalize_query(query: str) -> str:
    """M1 entry point: return the normalized query string."""
    text = nfc_normalize(query)
    text = collapse_whitespace(text)
    text = strip_trailing_punctuation(text)

    if tamil_utils.contains_tamil_script(text):
        text = _transliterate_script_terms(text)

    return _canonicalize_query(text)


def _transliterate_script_terms(text: str) -> str:
    """Replace Tamil-script aliases with canonical romanized names."""
    out = text
    for alias_lower, canonical in _alias_map().items():
        if tamil_utils.contains_tamil_script(alias_lower) and alias_lower in out:
            out = out.replace(alias_lower, canonical)
    return out


def _canonicalize_query(text: str) -> str:
    """Rewrite alias spans at word boundaries, longest alias first."""
    low = lowercase(text)
    out = text
    last_end = 0
    result: list[str] = []

    # Scan left-to-right; at each position try the longest alias pattern.
    patterns = _alias_patterns()
    i = 0
    while i < len(low):
        matched = False
        for pat, canonical in patterns:
            rx = re.compile(rf"(?<!\w){pat}(?!\w)")
            m = rx.match(low, i)
            if m:
                result.append(canonical)
                i = m.end()
                matched = True
                break
        if not matched:
            result.append(text[i])
            i += 1
    return "".join(result)

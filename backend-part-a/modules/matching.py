"""Lexicon matching helpers.

Every 1..4-word n-gram of the match text is looked up against lexicon
phrases (canonical names + aliases): exact hits first, then rapidfuzz
fuzzy matching with a configurable cutoff for variants/typos
("Thirukkural"/"Tirukkural"/"திருக்குறள்" and "black holesl" → "black hole").

Longer spans win, so "plasma oscillation" matches as one term before
"plasma" can match alone.
"""

from __future__ import annotations

import json
import re
from functools import lru_cache
from pathlib import Path

from rapidfuzz import fuzz
from rapidfuzz import process as rf_process

from parta.config import settings

LEXICON_DIR = Path(__file__).resolve().parents[1] / "config" / "lexicons"
_STRIP_RE = re.compile(r"[^\w\s\u0b80-\u0bff]")
_MAX_SPAN = 4


def load_lexicons() -> list[dict]:
    payloads: list[dict] = []
    for path in sorted(LEXICON_DIR.glob("*.json")):
        with path.open("r", encoding="utf-8") as fh:
            payloads.append(json.load(fh))
    return payloads


def flatten_terms(lexicons: list[dict]) -> list[dict]:
    flat: list[dict] = []
    for lex in lexicons:
        for term in lex["terms"]:
            flat.append(
                {
                    "domain": lex["domain"],
                    "name": term["name"],
                    "aliases": term.get("aliases", []),
                    "entity_type": term.get("type", "concept"),
                }
            )
    return flat


@lru_cache(maxsize=1)
def _phrase_index() -> tuple[tuple[str, ...], dict[str, dict]]:
    flat = flatten_terms(load_lexicons())
    phrases: list[str] = []
    lookup: dict[str, dict] = {}
    for t in flat:
        for variant in [t["name"], *t["aliases"]]:
            key = _STRIP_RE.sub(" ", variant.lower()).strip()
            key = re.sub(r"\s+", " ", key)
            if not key:
                continue
            if key not in lookup:
                phrases.append(key)
            lookup[key] = t
    return tuple(phrases), lookup


@lru_cache(maxsize=8192)
def match_ngram(gram: str) -> dict | None:
    """Resolve an n-gram to a lexicon term (exact first, then fuzzy).

    Fuzzy candidates must have the same word count as the n-gram — this
    prevents partial-overlap scores from swallowing whole phrases.
    """
    phrases, lookup = _phrase_index()
    if gram in lookup:
        return lookup[gram]
    if len(gram) < 4:
        return None
    n_words = len(gram.split())
    candidates = [p for p in phrases if len(p.split()) == n_words]
    if not candidates:
        return None
    result = rf_process.extractOne(
        gram,
        candidates,
        scorer=fuzz.token_sort_ratio,
        score_cutoff=settings.FUZZY_MATCH_CUTOFF,
    )
    if not result:
        return None
    best = result[0]
    return lookup.get(best)


def match_spans(match_text: str) -> list[dict]:
    """All lexicon hits in a text, longest-span-first, non-overlapping.

    Returns [{term, start, end, matched_text}] with character offsets into
    the *match text* (the lowercased, punctuation-stripped string).
    """
    tokens = _STRIP_RE.sub(" ", match_text.lower()).split()
    # token start offsets in the stripped string
    stripped = _STRIP_RE.sub(" ", match_text.lower())
    offsets: list[int] = []
    pos = 0
    for tok in tokens:
        pos = stripped.find(tok, pos)
        offsets.append(pos)
        pos += len(tok)

    hits: list[dict] = []
    taken: list[tuple[int, int]] = []
    for span in range(_MAX_SPAN, 0, -1):
        i = 0
        while i + span <= len(tokens):
            start_tok, end_tok = i, i + span
            s_off, e_off = offsets[start_tok], offsets[end_tok - 1] + len(tokens[end_tok - 1])
            if any(not (e_off <= ts or s_off >= te) for ts, te in taken):
                i += 1
                continue
            gram = " ".join(tokens[start_tok:end_tok])
            term = match_ngram(gram)
            if term:
                hits.append(
                    {"term": term, "start": s_off, "end": e_off, "matched_text": gram}
                )
                taken.append((s_off, e_off))
                i += span
            else:
                i += 1
    hits.sort(key=lambda h: h["start"])
    return hits

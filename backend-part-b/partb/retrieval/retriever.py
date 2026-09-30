"""Lightweight lexical retrieval over the validated knowledge bases.

Scoring: overlap of query terms with entry text fields (id-free),
weighting content > title > entities/keywords/aliases. Deterministic,
no external dependencies, easy to swap for embeddings later.
"""

from __future__ import annotations

import math
import re
from dataclasses import dataclass

from partb.contracts.enums import Dimension, Domain
from partb.kb.loader import KnowledgeBase, _tokenize
from partb.kb.schemas import KBEntry

_FIELD_WEIGHTS = {
    "content": 1.0,
    "title": 1.5,
    "entities": 1.8,
    "keywords": 1.3,
    "aliases": 1.6,
    "words": 1.2,
    "concepts": 1.4,
    "literal_meaning": 0.5,
    "translation": 0.6,
    "context": 0.7,
    "equations": 0.4,
    "processes": 0.6,
}

_WORD_RE = re.compile(r"[a-z0-9']+")


def _entry_tokens(entry: KBEntry) -> dict[str, set[str]]:
    fields: dict[str, set[str]] = {}
    fields["content"] = _tokenize(entry.content)
    fields["title"] = _tokenize(entry.title)
    fields["entities"] = _tokenize(" ".join(entry.entities))
    fields["keywords"] = _tokenize(" ".join(entry.keywords))
    fields["aliases"] = _tokenize(" ".join(entry.aliases))
    if entry.words:
        fields["words"] = _tokenize(" ".join(entry.words))
    if entry.concepts:
        fields["concepts"] = _tokenize(" ".join(entry.concepts))
    if entry.literal_meaning:
        fields["literal_meaning"] = _tokenize(entry.literal_meaning)
    if entry.translation:
        fields["translation"] = _tokenize(entry.translation)
    if entry.context:
        fields["context"] = _tokenize(entry.context)
    if entry.equations:
        fields["equations"] = _tokenize(" ".join(entry.equations))
    if entry.processes:
        fields["processes"] = _tokenize(" ".join(entry.processes))
    return fields


@dataclass(frozen=True)
class ScoredEntry:
    entry: KBEntry
    score: float


def retrieve_entries(
    kb: KnowledgeBase,
    terms: set[str],
    *,
    dimensions: list[Dimension],
    domains: list[Domain],
    max_items: int,
    min_score: float = 0.5,
) -> list[ScoredEntry]:
    """Score KB entries against query terms, filtered by dimension/domain."""
    terms = {t for t in terms if len(t) >= 3}
    if not terms:
        return []

    candidates: list[KBEntry] = []
    for domain in domains:
        for entry in kb.entries.get(domain, ()):
            if dimensions and entry.dimension not in dimensions:
                continue
            candidates.append(entry)

    scored: list[ScoredEntry] = []
    for entry in candidates:
        fields = _entry_tokens(entry)
        score = 0.0
        for term in terms:
            for field_name, weight in _FIELD_WEIGHTS.items():
                tokens = fields.get(field_name)
                if tokens and term in tokens:
                    score += weight
                    break
        if score > 0:
            # normalise by query size: weighted fraction of query terms matched
            score = score / len(terms)
            scored.append(ScoredEntry(entry=entry, score=score))

    scored.sort(key=lambda s: (-s.score, s.entry.id))
    return [s for s in scored if s.score >= min_score][:max_items]

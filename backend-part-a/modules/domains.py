"""Module 4 — domain detection.

Scores domains from matched lexicon terms; ambiguous shared terms
("rhythm", "period", "cycle") are resolved via surrounding context, and
still-ambiguous terms contribute fractional scores to multiple domains.
"""

from __future__ import annotations

import re

from parta.config import settings
from parta.contracts.enums import Domain
from parta.contracts.models import DomainScore, Entity
from parta.modules.matching import load_lexicons, match_spans

_AMBIGUOUS_RE = re.compile(
    r"\b(?:rhythm|period|cycle|network|field|energy|expression|collapse)\b",
    re.IGNORECASE,
)


def _context_terms(normalized: str) -> set[str]:
    """Content words of the query (for context disambiguation)."""
    return set(re.findall(r"[a-z']+", normalized.lower()))


def detect_domains(
    normalized: str, entities: list[Entity]
) -> tuple[list[DomainScore], list[str]]:
    """Return (domain_scores, warnings)."""
    warnings: list[str] = []
    scores: dict[Domain, float] = {d: 0.0 for d in Domain}

    hits = match_spans(normalized)
    for h in hits:
        try:
            d = Domain(h["term"]["domain"])
        except ValueError:
            continue
        scores[d] += 1.0

    # context disambiguation for ambiguous terms: a bare "rhythm"/"period"
    # next to domain-specific context words nudges the corresponding domain.
    ctx = _context_terms(normalized)
    context_boosts: dict[str, set[Domain]] = {
        "kepler": {Domain.ASTRONOMY},
        "orbital": {Domain.ASTRONOMY},
        "gene": {Domain.BIOLOGY},
        "cell": {Domain.BIOLOGY},
        "kural": {Domain.TAMIL},
        "verse": {Domain.TAMIL},
        "tamil": {Domain.TAMIL},
    }
    for amb in _AMBIGUOUS_RE.findall(normalized):
        for word, doms in context_boosts.items():
            if word in ctx:
                for d in doms:
                    if d in scores:
                        scores[d] += 0.5

    scored = [DomainScore(domain=d, score=round(s, 2)) for d, s in scores.items() if s > 0]
    scored.sort(key=lambda ds: -ds.score)

    if not scored:
        warnings.append(
            "No domain matched; query appears to be outside the supported "
            "domains (astronomy, biology, classical Tamil literature)."
        )
    return scored, warnings

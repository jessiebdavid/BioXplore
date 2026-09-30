"""M4 Domains: score {astronomy, biology, tamil} by lexicon term hits plus
context disambiguator hits. Returns a sorted list of DomainScore; an empty
result means the caller must raise NO_DOMAIN_MATCH (never guess).

Scoring (assumption, tuned to the spec's test table): lexicon term hit = 1.0,
disambiguator hit = 0.5, ambiguous terms (period, rhythm, cycle, network)
count 0.75 ONLY when the domain already has context (a term or disambiguator
hit), otherwise 0. Term matches are word-boundary regex matches; multiword
terms are matched as whole phrases.
"""
import re
from functools import lru_cache

import structlog

from app.contracts import DomainScore
from app.lexicons import get_lexicon

logger = structlog.get_logger(__name__)

AMBIGUOUS_TERMS = {"period", "rhythm", "cycle", "network"}
# 'time' is a Tamil theme but also generic scientific vocabulary: it counts
# for the tamil domain ONLY alongside another tamil signal (context-dependent).
CONTEXT_DEPENDENT_TERMS = {"time"}
TERM_HIT_SCORE = 1.0
DISAMBIGUATOR_HIT_SCORE = 0.5
AMBIGUOUS_WITH_CONTEXT_SCORE = 0.75


@lru_cache(maxsize=1)
def _lexicons() -> dict[str, dict[str, list[str]]]:
    astro = get_lexicon("astronomy")
    bio = get_lexicon("biology")
    tam = get_lexicon("tamil")
    return {
        "astronomy": {
            "terms": astro["terms"],
            "disambiguators": astro["disambiguators"],
        },
        "biology": {
            "terms": bio["terms"],
            "disambiguators": bio["disambiguators"],
        },
        "tamil": {
            "terms": tam["text_sources"] + tam["themes"],
            "disambiguators": tam["disambiguators"],
        },
    }


def _hits(low: str, terms: list[str]) -> int:
    """Count word-boundary hits of (escaped) terms in text."""
    return sum(
        1 for t in terms if re.search(rf"\b{re.escape(t.casefold())}\b", low)
    )


def score_domains(text: str) -> list[DomainScore]:
    """Score each domain; return non-zero scores sorted desc by score."""
    low = text.casefold()
    lex = _lexicons()
    out: list[DomainScore] = []

    for domain_name, data in lex.items():
        term_hits = _hits(
            low,
            [
                t
                for t in data["terms"]
                if t.casefold() not in AMBIGUOUS_TERMS
                and t.casefold() not in CONTEXT_DEPENDENT_TERMS
            ],
        )
        disamb_hits = _hits(low, data["disambiguators"])
        score = term_hits * TERM_HIT_SCORE + disamb_hits * DISAMBIGUATOR_HIT_SCORE

        # Ambiguous (and context-dependent) terms contribute only with domain
        # context already present.
        if score > 0.0:
            amb_hits = _hits(
                low,
                [
                    t
                    for t in data["terms"]
                    if t.casefold() in AMBIGUOUS_TERMS
                    or t.casefold() in CONTEXT_DEPENDENT_TERMS
                ],
            )
            score += amb_hits * AMBIGUOUS_WITH_CONTEXT_SCORE

        if score > 0.0:
            out.append(DomainScore(domain=domain_name,  # type: ignore[arg-type]
                                   score=round(score, 3)))

    out.sort(key=lambda s: s.score, reverse=True)
    logger.info("m4_result",
                domains=[(s.domain.value, s.score) for s in out])  # type: ignore[union-attr]
    return out

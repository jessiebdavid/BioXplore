"""M5 Entities: extract scientific terms, text sources, and Tamil theme words.

Each entity: {text, normalized_name, domain, entity_type, side?} with
entity_type in {concept, law, object, process, text_source, theme}.
Comparison queries label exactly two entities side='A' / side='B'.

Assumption: overlapping domain terms (e.g. 'gene' inside 'gene expression')
are resolved greedily longest-first and matched spans are not reused.
"""
from functools import lru_cache

import structlog

from app.contracts import Domain, Entity, EntityType
from app.lexicons import get_lexicon
from app.utils.text import lowercase

logger = structlog.get_logger(__name__)

_LAW_TERMS = {
    "kepler's laws", "kepler's first law", "kepler's second law",
    "kepler's third law", "radiation law", "general relativity",
    "special relativity", "black-body radiation",
}
_PROCESS_TERMS = {
    "accretion", "gravitational collapse", "nucleosynthesis", "transcription",
    "translation", "replication", "cell division", "mitosis", "meiosis",
    "apoptosis", "protein folding", "gene expression", "evolution",
    "development", "disease progression",
}
_OBJECT_TERMS = {
    "black hole", "white hole", "wormhole", "blazar", "quasar", "pulsar",
    "neutron star", "galaxy", "nebula", "cell", "nucleus", "ribosome",
    "membrane", "tissue", "organ", "organism",
}


@lru_cache(maxsize=1)
def _term_index() -> list[tuple[str, str, EntityType]]:
    """(term, domain, entity_type) sorted longest-first for greedy matching."""
    astro = get_lexicon("astronomy")
    bio = get_lexicon("biology")
    tam = get_lexicon("tamil")
    triples: list[tuple[str, str, EntityType]] = []

    def _astro_type(t: str) -> EntityType:
        tl = t.casefold()
        if tl in _LAW_TERMS:
            return EntityType.LAW
        if tl in _PROCESS_TERMS:
            return EntityType.PROCESS
        if tl in _OBJECT_TERMS:
            return EntityType.OBJECT
        return EntityType.CONCEPT

    def _bio_type(t: str) -> EntityType:
        tl = t.casefold()
        if tl in _PROCESS_TERMS:
            return EntityType.PROCESS
        if tl in _OBJECT_TERMS:
            return EntityType.OBJECT
        return EntityType.CONCEPT

    for t in astro["terms"]:
        triples.append((t, "astronomy", _astro_type(t)))
    for t in bio["terms"]:
        triples.append((t, "biology", _bio_type(t)))
    for t in tam["text_sources"]:
        triples.append((t, "tamil", EntityType.TEXT_SOURCE))
    for t in tam["themes"]:
        triples.append((t, "tamil", EntityType.THEME))

    triples.sort(key=lambda x: len(x[0]), reverse=True)
    return triples


def extract_entities(text: str, comparison: bool = False) -> list[Entity]:
    """Extract entities greedily (longest term first, no overlapping spans)."""
    low = lowercase(text)
    # found: (start, end, raw_text, term, domain, entity_type)
    found: list[tuple[int, int, str, str, str, EntityType]] = []

    for term, domain, etype in _term_index():
        t = term.casefold()
        idx = low.find(t)
        while idx != -1:
            end = idx + len(t)
            if not any(idx < e and end > s for s, e, *_ in found):
                found.append((idx, end, text[idx:end], term, domain, etype))
            idx = low.find(t, idx + 1)

    found.sort(key=lambda x: x[0])
    entities = [
        Entity(
            text=raw,
            normalized_name=term,
            domain=Domain(domain),  # type: ignore[arg-type]
            entity_type=etype,
        )
        for _, _, raw, term, domain, etype in found
    ]

    if comparison and len(entities) >= 2:
        entities[0] = entities[0].model_copy(update={"side": "A"})
        entities[1] = entities[1].model_copy(update={"side": "B"})

    logger.info(
        "m5_result",
        entities=[
            (e.normalized_name, e.domain.value, e.entity_type.value)  # type: ignore[union-attr]
            for e in entities
        ],
    )
    return entities

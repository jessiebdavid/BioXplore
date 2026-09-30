"""Module 5 — entity/concept extraction.

Extracts scientific terms, literary sources and Tamil theme words from the
normalized query using the lexicon matcher. Every entity carries the frozen
contract shape: {text, normalized_name, domain, entity_type, side}.

Comparison queries yield exactly two entities labelled side="A" and side="B"
(the two strongest hits on either side of the comparison marker).
"""

from __future__ import annotations

import re

from parta.contracts.enums import Domain, EntityType
from parta.contracts.models import Entity
from parta.modules.matching import match_spans

_COMPARISON_SPLIT = re.compile(r"\b(?:vs|versus|compared to|compared with)\b", re.IGNORECASE)


def extract_entities(normalized_query: str) -> list[Entity]:
    hits = match_spans(normalized_query)
    entities: list[Entity] = []
    seen_spans: set[tuple[int, int]] = set()
    for h in hits:
        key = (h["start"], h["end"])
        if key in seen_spans:
            continue
        seen_spans.add(key)
        t = h["term"]
        try:
            domain = Domain(t["domain"])
            etype = EntityType(t["entity_type"])
        except ValueError:
            continue
        entities.append(
            Entity(
                text=h["matched_text"],
                normalized_name=t["name"],
                domain=domain,
                entity_type=etype,
                side=None,
            )
        )
    return entities


def assign_comparison_sides(
    normalized_query: str, entities: list[Entity]
) -> list[Entity]:
    """For comparison queries, label the two main entities side A and side B."""
    split = _COMPARISON_SPLIT.search(normalized_query)
    if not split or len(entities) < 2:
        return entities

    cut = split.start()
    # order entities by their position in the ORIGINAL normalized text
    def _pos(e: Entity) -> int:
        idx = normalized_query.lower().find(e.text.lower())
        return idx if idx >= 0 else len(normalized_query)

    ordered = sorted(entities, key=_pos)
    left = [e for e in ordered if _pos(e) < cut]
    right = [e for e in ordered if _pos(e) >= cut]

    out: list[Entity] = []
    for i, e in enumerate(ordered):
        if left and e is left[0]:
            out.append(e.model_copy(update={"side": "A"}))
        elif right and e is right[0]:
            out.append(e.model_copy(update={"side": "B"}))
        else:
            out.append(e)
    return out

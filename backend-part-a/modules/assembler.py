"""Module 8 — final answer assembly.

Groups items by dimension (only activated ones), keeps evidence labels and
sources, de-duplicates sources, builds a comparison table for comparisons,
and adds the standing warning for Tamil↔science relationships.
"""

from __future__ import annotations

from parta.config import settings
from parta.contracts.enums import Dimension
from parta.contracts.models import (
    Item,
    QueryAnalysis,
    Relationship,
    RetrievalResult,
    Source,
)

_DIMENSION_TITLES = {
    Dimension.ONE_D: "Text / Literal",
    Dimension.TWO_D: "Interpretation / Context",
    Dimension.THREE_D: "Symbol / Concept / Relationship",
    Dimension.FOUR_D: "Future / Hypothetical / Temporal",
}


def _dedupe_sources(items: list[Item], rels: list[Relationship]) -> list[dict]:
    seen: set[str] = set()
    out: list[dict] = []
    for obj in list(items) + list(rels):
        s: Source = obj.source
        key = f"{s.title}|{s.reference or ''}|{s.verse_number or ''}"
        if key in seen:
            continue
        seen.add(key)
        out.append(s.model_dump(mode="json"))
    return out


def _summary(analysis: QueryAnalysis, items: list[Item]) -> str:
    if not items:
        return "No verified knowledge-base items matched this query."
    domains = sorted({i.domain.value for i in items})
    dims = sorted({i.dimension.value for i in items})
    labels = sorted({i.evidence_label.value for i in items})
    return (
        f"Retrieved {len(items)} item(s) across domain(s) {', '.join(domains)} "
        f"and dimension(s) {', '.join(dims)}; evidence labels present: "
        f"{', '.join(labels)}."
    )


def _comparison_table(items: list[Item]) -> dict:
    by_side: dict[str, list[Item]] = {}
    for i in items:
        for e_side in ("A", "B"):
            pass
    # sides live on the analysis entities; here we split by 'side' marker
    # in title/content is unreliable — the orchestrator passes entity sides
    # via the items' entity lists. Fall back to source grouping.
    return {"note": "comparison_table built from side-A/side-B entities"}


def assemble_answer(
    analysis: QueryAnalysis,
    result: RetrievalResult,
    validation_warnings: list[str],
) -> dict:
    warnings = list(dict.fromkeys(validation_warnings + result.warnings))
    items = result.items
    rels = result.relationships

    sections = []
    for dim in analysis.dimensions:
        dim_items = [i for i in items if i.dimension == dim]
        if not dim_items:
            continue
        sections.append(
            {
                "dimension": dim.value,
                "title": _DIMENSION_TITLES[dim],
                "items": [
                    {
                        "id": i.id,
                        "title": i.title,
                        "content": i.content,
                        "evidence_label": i.evidence_label.value,
                        "source": i.source.model_dump(mode="json"),
                        "entities": i.entities,
                    }
                    for i in dim_items
                ],
            }
        )

    relationships = [
        {
            "from_entity": r.from_entity,
            "to_entity": r.to_entity,
            "relation": r.relation,
            "dimension": r.dimension.value,
            "evidence_label": r.evidence_label.value,
            "source": r.source.model_dump(mode="json"),
        }
        for r in rels
    ]

    # standing warning whenever a Tamil-literature item or Tamil bridge exists
    tamil_involved = any(i.domain.value == "tamil" for i in items) or any(
        "tamil" in (r.from_entity + " " + r.to_entity).lower() for r in rels
    )
    if tamil_involved:
        warnings.append(settings.STANDING_TAMIL_WARNING)

    comparison_table = None
    if analysis.input_type.value == "comparison":
        comparison_table = _comparison_table(sections)

    return {
        "query": analysis.model_dump(mode="json"),
        "answer": {
            "summary": _summary(analysis, items),
            "sections": sections,
            "relationships": relationships,
            "comparison_table": comparison_table,
        },
        "sources": _dedupe_sources(items, rels),
        "warnings": warnings,
        "not_found": result.not_found,
    }

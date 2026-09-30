"""M8 Assemble: build the final response envelope from a validated
RetrievalResult plus the QueryAnalysis.

Shape:
{
  "query": {...QueryAnalysis...},
  "answer": {"summary", "sections": [{dimension, title, items}], "relationships",
             "comparison_table"?},
  "sources": [...],      # de-duplicated
  "warnings": [...],
  "not_found": [...]
}
Only activated dimensions appear. Items keep evidence_label + source. Labels
are never merged into one paragraph: each item stays a separate object.
"""
from typing import Any

import structlog

from app.contracts import (
    Dimension,
    QueryAnalysis,
    RetrievalResult,
)
from app.utils.dedup import dedupe_by_key

logger = structlog.get_logger(__name__)

_DIMENSION_TITLES: dict[str, str] = {
    "1D": "Text / Literal",
    "2D": "Interpretation / Context",
    "3D": "Symbol / Concept / Relationship",
    "4D": "Future / Hypothetical / Temporal",
}


def _item_payload(item: Any) -> dict[str, Any]:
    """One item -> dict keeping evidence_label and source, label-separated."""
    return {
        "content": item.content,
        "evidence_label": item.evidence_label.value if item.evidence_label else None,
        "source": item.source.model_dump(exclude_none=True) if item.source else None,
    }


def _dedup_sources(result: RetrievalResult) -> list[dict[str, Any]]:
    """De-duplicate sources across items and relationships metadata."""
    sources: list[dict[str, Any]] = []
    for item in result.items:
        if item.source is not None:
            sources.append(item.source.model_dump(exclude_none=True))
    return dedupe_by_key(sources, key_fn=lambda s: tuple(sorted(s.items())))


def _build_comparison_table(
    analysis: QueryAnalysis, result: RetrievalResult
) -> dict[str, Any] | None:
    """Two-column comparison table for comparison queries (side A vs B)."""
    sides = [e for e in analysis.entities if e.side in ("A", "B")]
    if len(sides) < 2:
        return None

    def _rows_for(side: str) -> dict[str, list[str]]:
        by_dim: dict[str, list[str]] = {}
        for item in result.items:
            if item.dimension == Dimension.D1:
                by_dim.setdefault("1D", []).append(
                    f"[{item.evidence_label.value if item.evidence_label else '?'}] "
                    f"{item.content}"
                )
        return by_dim

    rows_a = _rows_for("A")
    rows_b = _rows_for("B")
    aspects = sorted(set(rows_a) | set(rows_b))
    return {
        "A": sides[0].normalized_name,
        "B": sides[1].normalized_name,
        "aspects": [
            {"aspect": a, "A": rows_a.get(a, []), "B": rows_b.get(a, [])}
            for a in aspects
        ],
    }


def assemble_answer(
    analysis: QueryAnalysis, result: RetrievalResult
) -> dict[str, Any]:
    """Build the M8 envelope."""
    activated = {d.value for d in analysis.dimensions}

    sections: list[dict[str, Any]] = []
    for dim in analysis.dimensions:
        dim_items = [
            _item_payload(i) for i in result.items if i.dimension == dim
        ]
        if not dim_items:
            continue
        sections.append({
            "dimension": dim.value,
            "title": _DIMENSION_TITLES.get(dim.value, dim.value),
            "items": dim_items,
        })

    relationships = [
        {
            "source_entity": r.source_entity,
            "target_entity": r.target_entity,
            "relation": r.relation,
            "description": r.description,
            "is_conceptual": r.is_conceptual,
        }
        for r in result.relationships
    ]

    warnings = list(dict.fromkeys(result.warnings))
    not_found = list(dict.fromkeys(result.not_found))
    if not sections and not not_found:
        not_found = [analysis.normalized_query]

    envelope: dict[str, Any] = {
        "query": analysis.model_dump(mode="json"),
        "answer": {
            "summary": (
                f"Results for '{analysis.original_query}' "
                f"({analysis.input_type.value}, intent={analysis.intent.value})."
            ),
            "sections": sections,
            "relationships": relationships,
        },
        "sources": _dedup_sources(result),
        "warnings": warnings,
        "not_found": not_found,
    }

    if analysis.input_type.value == "comparison":
        table = _build_comparison_table(analysis, result)
        if table is not None:
            envelope["answer"]["comparison_table"] = table

    logger.info(
        "m8_result",
        sections=len(sections),
        relationships=len(relationships),
        sources=len(envelope["sources"]),
        not_found=len(not_found),
    )
    return envelope

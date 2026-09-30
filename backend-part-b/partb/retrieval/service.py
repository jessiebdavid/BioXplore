"""Orchestration: turn a QueryAnalysis into a RetrievalResult.

Rules:
  * Contract 1 is authoritative: never re-classify over HTTP.
  * dimensions=[] means "no dimension activated" -> search all dimensions
    and say so in warnings.
  * Tamil placeholders never enter the index (loader drops them), so Tamil
    queries honestly return not_found until verified verses are added.
  * Every item/relationship carries its source from the KB.
"""

from __future__ import annotations

import time
from typing import Optional

from partb.analyzer.local_analyzer import analyze_locally
from partb.contracts.enums import Dimension, Domain, InputType
from partb.contracts.models import (
    Item,
    QueryAnalysis,
    RetrievalResult,
    Source,
)
from partb.kb.loader import KnowledgeBase, load_kb
from partb.kb.schemas import KBEntry
from partb.retrieval.relationships import find_relationships
from partb.retrieval.retriever import ScoredEntry, retrieve_entries

_META_VERSION = "partb-retrieval/0.3"


def _entry_to_item(entry: KBEntry, score: float) -> Item:
    return Item(
        id=entry.id,
        dimension=entry.dimension,
        domain=entry.domain,
        title=entry.title,
        content=entry.content,
        evidence_label=entry.evidence_label,
        source=Source.model_validate(entry.source.model_dump(exclude={"verified"})),
        entities=list(entry.entities),
    )


def _format_domain_names(domains: list[Domain]) -> str:
    return ", ".join(d.value for d in domains) if domains else "none"


def retrieve(
    analysis: QueryAnalysis, kb: Optional[KnowledgeBase] = None
) -> RetrievalResult:
    started = time.perf_counter()
    kb = kb or load_kb()

    warnings: list[str] = list(analysis.warnings)
    not_found: list[str] = []

    # No domains detected -> search everywhere rather than silently nothing.
    domains = [ds.domain for ds in analysis.domains] or list(Domain)
    if not analysis.domains:
        warnings.append(
            "No domain scores provided; searched all domains (astronomy, biology, tamil)."
        )

    # Empty activated-dimension list -> search all dimensions, with a warning.
    dimensions = list(analysis.dimensions)
    if not dimensions:
        dimensions = list(Dimension)
        warnings.append(
            "No dimensions activated in the query analysis; searched all four dimensions."
        )

    terms = set(analysis.normalized_query.lower().split())
    for e in analysis.entities:
        terms.update(e.normalized_name.lower().replace("_", " ").split())

    max_items = analysis.options.max_items

    scored: list[ScoredEntry] = retrieve_entries(
        kb,
        terms,
        dimensions=dimensions,
        domains=domains,
        max_items=max_items,
    )
    items = [_entry_to_item(s.entry, s.score) for s in scored]

    cross = analysis.input_type in (
        InputType.cross_domain,
        InputType.multidimensional,
    ) or any(
        t in analysis.secondary_types
        for t in (InputType.cross_domain, InputType.multidimensional)
    )
    relationships = find_relationships(
        kb,
        terms,
        domains=domains,
        cross_domain=cross,
        max_items=max(max_items, 10),
    )

    # ---- honesty pass: report entities with no support in returned items ---
    corpus = "\n".join(
        f"{i.title} {i.content} {' '.join(i.entities)}".lower() for i in items
    )
    for e in analysis.entities:
        ent_terms = set(e.normalized_name.lower().replace("_", " ").split())
        if not (ent_terms & set(corpus.split())):
            not_found.append(e.text)

    # Tamil-specific honesty: if Tamil was in scope but nothing came back,
    # say so explicitly (KB has no verified verses yet).
    if Domain.TAMIL in domains and not any(i.domain == Domain.TAMIL for i in items):
        not_found.append(
            "tamil knowledge base: no verified verse records yet "
            "(verses are added only after verification against a cited edition)"
        )

    # Tamil + scientific dimension: guard against cross-claims.
    if Domain.TAMIL in domains and any(i.domain != Domain.TAMIL for i in items):
        warnings.append(
            "Results mix literary sources with scientific sources; literary items "
            "are not evidence for scientific claims."
        )

    elapsed_ms = round((time.perf_counter() - started) * 1000.0, 2)

    label_counts: dict[str, int] = {}
    for i in items:
        label_counts[i.evidence_label.value] = label_counts.get(i.evidence_label.value, 0) + 1
    for r in relationships:
        label_counts[r.evidence_label.value] = label_counts.get(r.evidence_label.value, 0) + 1

    retrieval_meta = {
        "engine": _META_VERSION,
        "domains_searched": [d.value for d in domains],
        "dimensions_activated": [d.value for d in analysis.dimensions] or None,
        "dimensions_searched": [d.value for d in dimensions],
        "items_returned": len(items),
        "items_per_dimension": {
            d.value: sum(1 for i in items if i.dimension == d) for d in Dimension
        },
        "relationships_returned": len(relationships),
        "label_summary": label_counts,
        "matched_terms": sorted(terms)[:40],
        "kb_counts": kb.counts(),
        "kb_rejected_records": len(kb.rejected),
        "elapsed_ms": elapsed_ms,
    }

    return RetrievalResult(
        items=items,
        relationships=relationships,
        not_found=not_found,
        warnings=warnings,
        retrieval_meta=retrieval_meta,
    )


def retrieve_from_raw(raw_query: str) -> RetrievalResult:
    """Local fallback pipeline for testing/demo (no Part A in the loop)."""
    analysis = analyze_locally(raw_query)
    return retrieve(analysis)

"""Relationship analysis (3D): graph lookup + cross-domain bridges.

A conceptual relationship between a scientific concept and a literary
concept is NOT scientific evidence; cross-domain records are restricted
to INTERPRETATION/ANALOGY at load time and are surfaced with their
original label so Part A can present them correctly.
"""

from __future__ import annotations

from partb.contracts.enums import Dimension, Domain
from partb.contracts.models import Relationship, Source
from partb.kb.loader import KnowledgeBase, _tokenize
from partb.kb.schemas import KBRelationship


def _singularize(terms: set[str]) -> set[str]:
    """Crude plural folding so 'periods' matches 'period' endpoints."""
    out: set[str] = set()
    for t in terms:
        out.add(t)
        if t.endswith("s") and len(t) > 3:
            out.add(t[:-1])
    return out


def _rel_matches_terms(rel: KBRelationship, terms: set[str]) -> float:
    terms = _singularize(terms)
    endpoint_terms = _tokenize(f"{rel.from_entity} {rel.to_entity}")
    qualifier_terms = _tokenize(rel.qualifier)
    hits = len(endpoint_terms & terms) * 2.0
    hits += 0.5 * len(qualifier_terms & terms)
    return hits


def _to_contract(rel: KBRelationship) -> Relationship:
    return Relationship(
        from_entity=rel.from_entity,
        to_entity=rel.to_entity,
        relation=rel.relation,
        dimension=rel.dimension,
        evidence_label=rel.evidence_label,            source=Source.model_validate(rel.source.model_dump(exclude={"verified"})),
    )


def _cross_domain_involved(rel: KBRelationship, domains: list[Domain]) -> bool:
    """True if the bridge touches any of the requested domains."""
    if not rel.cross_domain:
        return False
    rel_domains = _tokenize(f"{rel.from_entity} {rel.to_entity} {rel.qualifier}")
    marker = {d.value for d in domains}
    text = f"{rel.from_entity} {rel.to_entity} {rel.qualifier}".lower()
    return any(m in text for m in marker)


def find_relationships(
    kb: KnowledgeBase,
    terms: set[str],
    *,
    domains: list[Domain],
    cross_domain: bool,
    max_items: int,
) -> list[Relationship]:
    """Return relationships whose endpoints match the query terms.

    Cross-domain bridges are only returned when cross_domain=True
    (3D + explicit cross-domain/multidimensional queries).
    """
    results: list[tuple[float, Relationship]] = []
    for rel in kb.relationships:
        if rel.cross_domain and not cross_domain:
            continue
        if not rel.cross_domain and domains and rel.domain not in domains:
            skip = True
        else:
            skip = False
        if skip:
            continue
        score = _rel_matches_terms(rel, terms)
        if score >= 2.0:  # at least one endpoint term must match
            results.append((score, _to_contract(rel)))

    results.sort(key=lambda p: (-p[0], p[1].from_entity, p[1].to_entity))
    return [r for _, r in results[:max_items]]


def cross_domain_bridges(
    kb: KnowledgeBase, terms: set[str], *, max_items: int
) -> list[Relationship]:
    """Explicit cross-domain bridges matching the query terms (labelled)."""
    scored: list[tuple[float, Relationship]] = []
    for rel in kb.relationships:
        if not rel.cross_domain:
            continue
        score = _rel_matches_terms(rel, terms)
        if score >= 2.0:
            scored.append((score, _to_contract(rel)))
    scored.sort(key=lambda p: (-p[0], p[1].from_entity))
    return [r for _, r in scored[:max_items]]

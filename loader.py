"""Load, validate and index the JSON knowledge bases.

Rules enforced here (fail fast at startup):
  * every entry must have a non-empty source title;
  * astronomy/biology entries must carry a reference (URL/DOI/ISBN);
  * tamil entries must be verified=True with text_name + verse_number + author,
    or they are rejected from retrieval (placeholders stay on disk only);
  * cross-domain relationships may only be INTERPRETATION or ANALOGY.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path

from partb.contracts.enums import Dimension, Domain, EvidenceLabel
from partb.kb.schemas import KBEntry, KBRelationship

DATA_DIR = Path(__file__).resolve().parent / "data"

_ALLOWED_CROSS_LABELS = {EvidenceLabel.INTERPRETATION, EvidenceLabel.ANALOGY}
_WORD_RE = re.compile(r"[a-z0-9']+")


class KBValidationError(ValueError):
    """Raised when a knowledge-base file violates provenance rules."""


@dataclass(frozen=True)
class KnowledgeBase:
    """Validated, indexed snapshot of all knowledge bases."""

    entries: dict[Domain, tuple[KBEntry, ...]]
    relationships: tuple[KBRelationship, ...]
    rejected: tuple[str, ...] = field(default_factory=tuple)

    @property
    def all_entries(self) -> tuple[KBEntry, ...]:
        return tuple(e for domain_entries in self.entries.values() for e in domain_entries)

    def counts(self) -> dict[str, int]:
        return {
            "astronomy": len(self.entries.get(Domain.ASTRONOMY, ())),
            "biology": len(self.entries.get(Domain.BIOLOGY, ())),
            "tamil": len(self.entries.get(Domain.TAMIL, ())),
            "relationships": len(self.relationships),
        }


def _tokenize(text: str) -> set[str]:
    return set(_WORD_RE.findall(text.lower()))


def _validate_entry(entry: KBEntry) -> str | None:
    """Return a rejection reason, or None if the entry is retrievable."""
    if not entry.source.title.strip():
        return f"{entry.id}: missing source title"
    if entry.domain == Domain.TAMIL:
        if not entry.verified:
            return f"{entry.id}: tamil entry not verified (placeholder or unchecked verse)"
        s = entry.source
        if not (s.text_name and s.verse_number and s.author):
            return (
                f"{entry.id}: tamil entry missing text_name/verse_number/author "
                "(every verse must carry full source info)"
            )
        if entry.content.strip() == "<<TO BE FILLED FROM VERIFIED EDITION>>":
            return f"{entry.id}: tamil verse text still a placeholder"
    else:
        if not (entry.source.reference and entry.source.reference.strip()):
            return f"{entry.id}: scientific entry missing reference (URL/DOI/ISBN)"
    return None


def _validate_relationship(rel: KBRelationship) -> str | None:
    if not rel.source.title.strip():
        return f"{rel.id}: missing source title"
    if rel.cross_domain:
        if rel.evidence_label not in _ALLOWED_CROSS_LABELS:
            return (
                f"{rel.id}: cross-domain relationship must be INTERPRETATION or "
                f"ANALOGY, got {rel.evidence_label.value}"
            )
        if not rel.qualifier.strip():
            return f"{rel.id}: cross-domain relationship must explain the parallel"
    elif not (rel.source.reference and rel.source.reference.strip()):
        return f"{rel.id}: in-domain relationship missing reference"
    return None


def _load_domain_file(path: Path, expected_domain: Domain) -> list[KBEntry]:
    with path.open("r", encoding="utf-8") as fh:
        payload = json.load(fh)
    if payload.get("domain") != expected_domain.value:
        raise KBValidationError(
            f"{path.name}: declared domain {payload.get('domain')!r} != {expected_domain.value!r}"
        )
    entries: list[KBEntry] = []
    for raw in payload.get("entries", []):
        entries.append(KBEntry.model_validate(raw))
    return entries


@lru_cache(maxsize=1)
def load_kb() -> KnowledgeBase:
    """Load and validate every KB file. Raises KBValidationError on violations."""
    by_domain: dict[Domain, list[KBEntry]] = {d: [] for d in Domain}
    rejected: list[str] = []

    for domain in Domain:
        path = DATA_DIR / f"{domain.value}.json"
        if not path.exists():
            continue
        for entry in _load_domain_file(path, domain):
            reason = _validate_entry(entry)
            if reason:
                rejected.append(reason)
            else:
                by_domain[domain].append(entry)

    rel_path = DATA_DIR / "relationships.json"
    relationships: list[KBRelationship] = []
    if rel_path.exists():
        with rel_path.open("r", encoding="utf-8") as fh:
            payload = json.load(fh)
        for raw in payload.get("relationships", []):
            rel = KBRelationship.model_validate(raw)
            reason = _validate_relationship(rel)
            if reason:
                rejected.append(reason)
            else:
                relationships.append(rel)

    entries = {d: tuple(v) for d, v in by_domain.items()}
    return KnowledgeBase(
        entries=entries,
        relationships=tuple(relationships),
        rejected=tuple(rejected),
    )

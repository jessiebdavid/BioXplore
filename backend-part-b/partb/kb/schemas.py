"""Internal knowledge-base entry schemas.

These are Part B-internal (NOT part of the frozen contracts with Part A),
so they may evolve. Every entry still carries full provenance.

Provenance rules enforced by kb/loader.py at load time:
  * every entry must have a non-empty source title;
  * every astronomy/biology entry must carry a resolvable reference
    (URL or explicit book/paper reference), otherwise it is rejected;
  * every tamil entry must be verified=True with text_name + verse_number +
    author, otherwise it is rejected from retrieval;
  * cross-domain relationships may only be INTERPRETATION or ANALOGY.
"""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from partb.contracts.enums import (
    Dimension,
    Domain,
    EntityType,
    EvidenceLabel,
)
from partb.contracts.models import Source


class KBSource(Source):
    """Source + internal-only verification flags (never serialized to Part A)."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    verified: bool = True


class KBEntry(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid")

    id: str
    dimension: Dimension
    domain: Domain
    title: str
    content: str  # for tamil entries this is the original verse text
    evidence_label: EvidenceLabel
    verified: bool = True  # placeholders / unverified records must set False
    source: KBSource
    entities: list[str] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list)
    aliases: list[str] = Field(default_factory=list)

    # -- astronomy extras -------------------------------------------------
    equations: list[str] = Field(default_factory=list)

    # -- biology extras ----------------------------------------------------
    processes: list[str] = Field(default_factory=list)

    # -- tamil extras -------------------------------------------------------
    words: list[str] = Field(default_factory=list)
    literal_meaning: Optional[str] = None
    translation: Optional[str] = None
    context: Optional[str] = None
    concepts: list[str] = Field(default_factory=list)


class KBRelationship(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid")

    id: str
    from_entity: str
    to_entity: str
    relation: str
    dimension: Dimension = Dimension.THREE_D
    evidence_label: EvidenceLabel
    qualifier: str = ""
    source: KBSource
    cross_domain: bool = False
    domain: Domain = Domain.ASTRONOMY  # home KB file for cross-domain bridges

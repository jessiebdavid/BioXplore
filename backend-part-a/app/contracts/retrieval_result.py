"""Frozen Contract 2: RetrievalResult. DO NOT EDIT field names.

Assumption note: the pasted contract file never arrived, so this module was
reconstructed from every field reference in the spec (source.text_name,
source.verse_number, citation, url; items with dimension, evidence_label,
item warnings; top-level warnings, not_found, relationships, retrieval_meta).
Field names below must match Part B.
"""
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from .enums import Dimension, EvidenceLabel


class Source(BaseModel):
    model_config = ConfigDict(extra="forbid")

    text_name: str | None = None
    verse_number: int | None = None
    citation: str | None = None
    url: str | None = None


class RetrievalItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    dimension: Dimension
    # Optional BY DESIGN: M9 drops items without an evidence_label (with a
    # warning) instead of rejecting the whole result as INVALID_RESULT.
    evidence_label: EvidenceLabel | None = None
    content: str
    source: Source | None = None
    relationships: list[dict[str, Any]] = Field(default_factory=list)


class Relationship(BaseModel):
    model_config = ConfigDict(extra="forbid")

    source_entity: str
    target_entity: str
    relation: str
    description: str | None = None
    is_conceptual: bool = False


class RetrievalResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    topic: str
    items: list[RetrievalItem] = Field(default_factory=list)
    relationships: list[Relationship] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    not_found: list[str] = Field(default_factory=list)
    retrieval_meta: dict[str, Any] = Field(default_factory=dict)

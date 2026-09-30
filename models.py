"""Frozen contracts shared with Part A.

Mirror of Part A's models: Pydantic v2, frozen=True, extra="forbid".
Do not add, rename or remove fields without team agreement on both sides.
"""

from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

from .enums import (
    Dimension,
    Domain,
    EntityType,
    EvidenceLabel,
    InputType,
    Intent,
)


class Source(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid")

    title: str
    reference: Optional[str] = None
    text_name: Optional[str] = None
    verse_number: Optional[str] = None
    chapter: Optional[str] = None
    author: Optional[str] = None


class DomainScore(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid")

    domain: Domain
    score: float


class Entity(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid")

    text: str
    normalized_name: str
    domain: Domain
    entity_type: EntityType
    side: Optional[Literal["A", "B"]] = None


class QueryOptions(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid")

    max_items: int = Field(default=20, ge=1, le=100)


class QueryAnalysis(BaseModel):
    """Contract 1: INPUT to Part B. Produced by Part A."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    raw_query: str
    normalized_query: str
    input_type: InputType
    input_type_confidence: float = Field(ge=0.0, le=1.0)
    secondary_types: list[InputType]
    intent: Intent
    domains: list[DomainScore]
    entities: list[Entity]
    dimensions: list[Dimension]  # only the activated ones
    dimension_reasons: dict[Dimension, str]
    options: QueryOptions
    language: Literal["en", "ta", "mixed"]
    warnings: list[str]


class Item(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid")

    id: str
    dimension: Dimension
    domain: Domain
    title: str
    content: str
    evidence_label: EvidenceLabel
    source: Source
    entities: list[str]


class Relationship(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid")

    from_entity: str
    to_entity: str
    relation: str
    dimension: Dimension
    evidence_label: EvidenceLabel
    source: Source


class RetrievalResult(BaseModel):
    """Contract 2: OUTPUT from Part B. Consumed by Part A."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    items: list[Item]
    relationships: list[Relationship]
    not_found: list[str]
    warnings: list[str]
    retrieval_meta: dict

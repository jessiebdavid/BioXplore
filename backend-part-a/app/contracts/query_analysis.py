"""Frozen Contract 1: QueryAnalysis. DO NOT EDIT field names.

Assumption note: the pasted contract file never arrived, so this module was
reconstructed from every field reference in the spec (entity side labels,
domain scores, input_type/confidence/secondary_types, intent, dimensions +
dimension_reasons, analysis_meta). Field names below must match Part B.
"""
from typing import Any
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field

from .enums import Dimension, Domain, EntityType, InputType, Intent


class Entity(BaseModel):
    model_config = ConfigDict(extra="forbid")

    text: str
    normalized_name: str
    domain: Domain
    entity_type: EntityType
    side: str | None = None


class DomainScore(BaseModel):
    model_config = ConfigDict(extra="forbid")

    domain: Domain
    score: float


class QueryAnalysis(BaseModel):
    model_config = ConfigDict(extra="forbid")

    query_id: str = Field(default_factory=lambda: uuid4().hex)
    original_query: str
    normalized_query: str
    input_type: InputType
    input_type_confidence: float = Field(ge=0.0, le=1.0)
    secondary_types: list[InputType] = Field(default_factory=list)
    intent: Intent
    domains: list[DomainScore] = Field(default_factory=list)
    entities: list[Entity] = Field(default_factory=list)
    dimensions: list[Dimension] = Field(default_factory=list)
    dimension_reasons: dict[str, str] = Field(default_factory=dict)
    analysis_meta: dict[str, Any] = Field(default_factory=dict)

"""PipelineContext: the per-request bag passed through pipeline stages.

Assumption: a mutable dataclass is the simplest stateless carrier; it lives
only for the duration of one request (no persistence).
"""
from dataclasses import dataclass, field
from typing import Any

from app.contracts import (
    Dimension,
    DomainScore,
    Entity,
    InputType,
    Intent,
    QueryAnalysis,
)


@dataclass
class PipelineContext:
    """Carries query state through M1..M9 and M8 assembly."""

    original_query: str
    normalized_query: str = ""
    input_type: InputType | None = None
    input_type_confidence: float = 0.0
    secondary_types: list[InputType] = field(default_factory=list)
    intent: Intent | None = None
    domain_scores: list[DomainScore] = field(default_factory=list)
    entities: list[Entity] = field(default_factory=list)
    dimensions: list[Dimension] = field(default_factory=list)
    dimension_reasons: dict[str, str] = field(default_factory=dict)
    options: dict[str, Any] = field(default_factory=dict)
    stage_timings: dict[str, float] = field(default_factory=dict)
    notes: dict[str, Any] = field(default_factory=dict)
    warnings: list[str] = field(default_factory=list)

    def to_query_analysis(self) -> QueryAnalysis:
        """Build Contract 1 from the populated context (stage 7)."""
        assert self.input_type is not None, "input_type missing (M2)"
        assert self.intent is not None, "intent missing (M3)"
        return QueryAnalysis(
            original_query=self.original_query,
            normalized_query=self.normalized_query,
            input_type=self.input_type,
            input_type_confidence=self.input_type_confidence,
            secondary_types=list(self.secondary_types),
            intent=self.intent,
            domains=list(self.domain_scores),
            entities=list(self.entities),
            dimensions=list(self.dimensions),
            dimension_reasons=dict(self.dimension_reasons),
            analysis_meta={"stage_timings_ms": dict(self.stage_timings)},
        )

"""Request/response schemas for /query. Response body is the M8 envelope
(dict), so only the request side is strictly typed here.
"""
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.contracts import Dimension


class QueryOptions(BaseModel):
    model_config = ConfigDict(extra="forbid")

    dimensions: list[Dimension] | None = Field(
        default=None,
        description="Explicit dimension override (e.g. ['1D','3D']).",
    )
    max_items: int | None = Field(
        default=None, ge=1, le=100,
        description="Cap on total items returned after validation.",
    )


class QueryRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    # min_length intentionally NOT set: EMPTY_QUERY is produced by the route
    # (which also treats whitespace-only strings) so the error envelope is
    # {"error": {"code": "EMPTY_QUERY", ...}} rather than FastAPI's 422.
    query: str
    options: QueryOptions = Field(default_factory=QueryOptions)

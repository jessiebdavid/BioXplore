"""POST /query: run the pipeline and return the M8 envelope."""
from typing import Any

from fastapi import APIRouter, Request

from app.api.errors import (
    ApiError,
    EmptyQueryError,
    QueryTooLongError,
)
from app.api.schemas import QueryRequest
from app.core.config import get_settings
from app.core.logging import get_logger
from app.pipeline.orchestrator import run_pipeline
from app.retrieval.factory import get_retriever
from app.llm.null_provider import NullProvider

logger = get_logger(__name__)
router = APIRouter()


@router.post("/query")
async def post_query(body: QueryRequest, request: Request) -> dict[str, Any]:
    settings = get_settings()
    raw_query = body.query

    if not raw_query or not raw_query.strip():
        raise EmptyQueryError()
    if len(raw_query) > settings.max_query_length:
        raise QueryTooLongError(settings.max_query_length)

    retriever = get_retriever(settings)
    # Only the NullProvider ships; PKA_LLM_BACKEND=null is the only supported
    # value and nothing in the test suite requires a real LLM.
    provider = NullProvider() if settings.llm_backend == "null" else None

    envelope = await run_pipeline(
        query=raw_query,
        options=body.options.model_dump(),
        retriever=retriever,
        llm_provider=provider,
    )
    logger.info("query_ok", query=raw_query[:80])
    return envelope

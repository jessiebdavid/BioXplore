"""GET /health: own status; when backend=http also ping Part B /health.

Part B being down never fails this endpoint — it is reported, not raised.
"""
from fastapi import APIRouter

from app.core.config import get_settings
from app.core.logging import get_logger
from app.retrieval.http_client import HttpRetriever

logger = get_logger(__name__)
router = APIRouter()


@router.get("/health")
async def get_health() -> dict[str, str]:
    settings = get_settings()
    status: dict[str, str] = {"status": "ok"}
    if settings.retriever_backend == "http":
        retriever = HttpRetriever(settings)
        part_b = await retriever.ping()
        status.update(part_b)
    return status

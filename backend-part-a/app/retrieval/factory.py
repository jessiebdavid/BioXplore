"""Retriever factory: the one-line backend switch.

PKA_RETRIEVER_BACKEND=stub -> StubRetriever (in-process fixtures)
PKA_RETRIEVER_BACKEND=http -> HttpRetriever (calls Part B)
"""
from app.core.config import Settings, get_settings
from app.retrieval.base import Retriever
from app.retrieval.http_client import HttpRetriever
from app.retrieval.stub import StubRetriever


def get_retriever(settings: Settings | None = None) -> Retriever:
    settings = settings or get_settings()
    if settings.retriever_backend == "http":
        return HttpRetriever(settings)
    return StubRetriever()

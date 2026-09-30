"""Retrieval backend interface (Module 7, step 7)."""

from __future__ import annotations

from typing import Protocol

from parta.contracts.models import QueryAnalysis, RetrievalResult


class RetrievalBackend(Protocol):
    def retrieve(self, analysis: QueryAnalysis) -> RetrievalResult: ...


class RetrievalFailed(Exception):
    """Raised when the retrieval backend cannot be reached or fails."""

    def __init__(self, message: str):
        self.code = "RETRIEVAL_FAILED"
        self.message = message
        super().__init__(message)

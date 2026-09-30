"""Retriever Protocol: the only interface Part A uses to reach knowledge."""
from typing import Protocol, runtime_checkable

from app.contracts import QueryAnalysis, RetrievalResult


@runtime_checkable
class Retriever(Protocol):
    async def retrieve(self, analysis: QueryAnalysis) -> RetrievalResult:
        """Return Contract 2 for the given Contract 1."""
        ...

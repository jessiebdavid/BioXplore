"""LLMProvider protocol. Part A ships only the NullProvider; nothing in the
test suite may require a real LLM.
"""
from typing import Protocol, runtime_checkable

from app.contracts import InputType


@runtime_checkable
class LLMProvider(Protocol):
    async def disambiguate_input_type(
        self, query: str, candidates: list[InputType]
    ) -> str | None:
        """Return the winning candidate value, or None to keep rule results."""
        ...

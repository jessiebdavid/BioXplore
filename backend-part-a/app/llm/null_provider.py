"""NullProvider: always returns None so rule-based results always stand."""
from app.contracts import InputType


class NullProvider:
    async def disambiguate_input_type(
        self, query: str, candidates: list[InputType]
    ) -> str | None:
        return None

"""HTTP retrieval backend — calls the real Part B service."""

from __future__ import annotations

import httpx

from parta.config import settings
from parta.contracts.models import QueryAnalysis, RetrievalResult
from parta.retrieval.base import RetrievalFailed


class HttpRetrievalBackend:
    def __init__(
        self,
        base_url: str | None = None,
        timeout_s: float | None = None,
    ):
        self.base_url = (base_url or settings.PART_B_BASE_URL).rstrip("/")
        self.timeout_s = timeout_s or settings.PART_B_TIMEOUT_S

    def health(self) -> dict:
        try:
            resp = httpx.get(f"{self.base_url}/health", timeout=self.timeout_s)
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPError as exc:
            raise RetrievalFailed(f"Part B health check failed: {exc}") from exc

    def retrieve(self, analysis: QueryAnalysis) -> RetrievalResult:
        payload = analysis.model_dump(mode="json")
        try:
            resp = httpx.post(
                f"{self.base_url}/retrieve",
                json=payload,
                timeout=self.timeout_s,
            )
            resp.raise_for_status()
            return RetrievalResult.model_validate(resp.json())
        except httpx.TimeoutException as exc:
            raise RetrievalFailed(f"Part B timed out after {self.timeout_s}s") from exc
        except httpx.HTTPError as exc:
            raise RetrievalFailed(f"Part B request failed: {exc}") from exc
        except ValueError as exc:
            raise RetrievalFailed(f"Part B returned an invalid payload: {exc}") from exc

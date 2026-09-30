"""HttpRetriever: calls Part B POST /retrieve (and GET /health for ping).

Network errors / timeouts / non-2xx map to RETRIEVAL_FAILED. A 2xx body that
fails RetrievalResult validation maps to INVALID_RESULT. One retry is made on
transient failures (timeouts and 5xx).
"""
import httpx
import structlog

from app.contracts import QueryAnalysis, RetrievalResult
from app.core.config import Settings

logger = structlog.get_logger(__name__)


class RetrievalFailedError(Exception):
    """Part B unreachable, timed out, or returned an error status."""


class InvalidResultError(Exception):
    """Part B returned a body that does not satisfy Contract 2."""


class HttpRetriever:
    def __init__(self, settings: Settings) -> None:
        self._base_url = settings.part_b_base_url.rstrip("/")
        self._timeout_s = settings.retrieval_timeout_s

    async def retrieve(self, analysis: QueryAnalysis) -> RetrievalResult:
        payload = analysis.model_dump(mode="json")
        last_error: Exception | None = None

        for attempt in (1, 2):  # one retry
            try:
                async with httpx.AsyncClient(timeout=self._timeout_s) as client:
                    resp = await client.post(
                        f"{self._base_url}/retrieve", json=payload
                    )
                if resp.status_code >= 500 and attempt == 1:
                    last_error = RetrievalFailedError(
                        f"Part B returned HTTP {resp.status_code}"
                    )
                    logger.warning("retrieval_retry", attempt=attempt,
                                   status=resp.status_code)
                    continue
                if resp.is_error:
                    raise RetrievalFailedError(
                        f"Part B returned HTTP {resp.status_code}: "
                        f"{resp.text[:300]}"
                    )
                try:
                    return RetrievalResult.model_validate_json(resp.content)
                except ValueError as exc:
                    raise InvalidResultError(
                        f"Part B response failed contract validation: {exc}"
                    ) from exc
            except (httpx.TimeoutException, httpx.TransportError) as exc:
                last_error = RetrievalFailedError(f"Part B unreachable: {exc}")
                logger.warning("retrieval_retry", attempt=attempt, error=str(exc))
                continue

        raise last_error or RetrievalFailedError("Part B call failed")

    async def ping(self) -> dict[str, str]:
        """Ping Part B /health; never raises, returns a status report."""
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                resp = await client.get(f"{self._base_url}/health")
            if resp.is_error:
                return {"part_b": f"error (HTTP {resp.status_code})"}
            return {"part_b": "ok"}
        except (httpx.TimeoutException, httpx.TransportError) as exc:
            logger.warning("part_b_health_down", error=str(exc))
            return {"part_b": "unreachable"}

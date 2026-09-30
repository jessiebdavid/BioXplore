"""API error codes, envelope, and exception handlers.

Envelope: {"error": {"code": str, "message": str}}
"""
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.core.logging import get_logger
from app.pipeline.orchestrator import NoDomainMatchError
from app.retrieval.http_client import InvalidResultError, RetrievalFailedError

logger = get_logger(__name__)

STATUS_BY_CODE = {
    "EMPTY_QUERY": 400,
    "QUERY_TOO_LONG": 400,
    "NO_DOMAIN_MATCH": 400,
    "RETRIEVAL_FAILED": 502,
    "INVALID_RESULT": 502,
}


class ApiError(Exception):
    def __init__(self, code: str, message: str) -> None:
        self.code = code
        self.message = message
        status = STATUS_BY_CODE.get(code, 500)
        self.status_code = status
        super().__init__(message)


class EmptyQueryError(ApiError):
    def __init__(self) -> None:
        super().__init__("EMPTY_QUERY", "Query must be a non-empty string.")


class QueryTooLongError(ApiError):
    def __init__(self, max_length: int) -> None:
        super().__init__(
            "QUERY_TOO_LONG",
            f"Query exceeds maximum length of {max_length} characters.",
        )


class NoDomainMatch(ApiError):
    def __init__(self) -> None:
        super().__init__(
            "NO_DOMAIN_MATCH",
            "Query does not match any known domain (astronomy, biology, tamil).",
        )


def error_response(code: str, message: str) -> JSONResponse:
    return JSONResponse(
        status_code=STATUS_BY_CODE.get(code, 500),
        content={"error": {"code": code, "message": message}},
    )


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(ApiError)
    async def _api_error_handler(request: Request, exc: ApiError) -> JSONResponse:
        logger.warning("api_error", code=exc.code, message=exc.message)
        return error_response(exc.code, exc.message)

    @app.exception_handler(NoDomainMatchError)
    async def _no_domain_handler(
        request: Request, exc: NoDomainMatchError
    ) -> JSONResponse:
        logger.warning("api_error", code="NO_DOMAIN_MATCH", query=str(exc))
        return error_response("NO_DOMAIN_MATCH",
                              "Query does not match any known domain "
                              "(astronomy, biology, tamil).")

    @app.exception_handler(RetrievalFailedError)
    async def _retrieval_failed_handler(
        request: Request, exc: RetrievalFailedError
    ) -> JSONResponse:
        logger.error("retrieval_failed", error=str(exc))
        return error_response("RETRIEVAL_FAILED",
                              f"Knowledge retrieval failed: {exc}")

    @app.exception_handler(InvalidResultError)
    async def _invalid_result_handler(
        request: Request, exc: InvalidResultError
    ) -> JSONResponse:
        logger.error("invalid_result", error=str(exc))
        return error_response("INVALID_RESULT",
                              f"Knowledge service returned an invalid result: {exc}")

    @app.exception_handler(Exception)
    async def _unhandled_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.error("unhandled_error", error=str(exc), exc_info=True)
        return error_response("RETRIEVAL_FAILED",
                              "Internal processing error.")

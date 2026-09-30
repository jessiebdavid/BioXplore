"""Module 10 — API.

POST /query {"query": str, "options": {"dimensions": [...], "max_items": int}}
GET  /health

Errors are always {"error": {"code": ..., "message": ...}} with the codes
EMPTY_QUERY, QUERY_TOO_LONG, NO_DOMAIN_MATCH, RETRIEVAL_FAILED, INVALID_RESULT.
CORS is enabled for the frontend.
"""

from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator

from parta.modules.input_handler import InputError
from parta.modules.orchestrator import run_pipeline
from parta.retrieval.base import RetrievalFailed

logger = logging.getLogger("parta.api")

app = FastAPI(title="Multidimensional Knowledge System — Part A", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryBody(BaseModel):
    query: str
    options: dict | None = Field(default=None)

    @field_validator("query")
    @classmethod
    def _query_must_be_string(cls, v: str) -> str:
        if v is None:
            raise ValueError("empty")
        return v


@app.exception_handler(InputError)
async def _input_error_handler(request, exc: InputError):
    return JSONResponse(
        status_code=400,
        content={"error": {"code": exc.code, "message": exc.message}},
    )


@app.exception_handler(RetrievalFailed)
async def _retrieval_error_handler(request, exc: RetrievalFailed):
    return JSONResponse(
        status_code=502,
        content={"error": {"code": exc.code, "message": exc.message}},
    )


@app.get("/health")
def health() -> dict:
    from parta.config import settings

    body = {
        "status": "ok",
        "service": "parta-api",
        "version": "0.1.0",
        "retrieval_backend": settings.RETRIEVAL_BACKEND,
    }
    if settings.RETRIEVAL_BACKEND == "http":
        try:
            from parta.retrieval.http_backend import HttpRetrievalBackend

            body["part_b"] = HttpRetrievalBackend().health()
        except RetrievalFailed as exc:
            body["part_b"] = {"status": "unreachable", "error": exc.message}
    return body


@app.post("/query")
def query(body: QueryBody) -> dict:
    options = body.options or {}
    dimensions_hint = options.get("dimensions")
    try:
        return run_pipeline(body.query, dimensions_hint=dimensions_hint)
    except InputError:
        raise
    except RetrievalFailed:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("pipeline failure")
        return JSONResponse(
            status_code=500,
            content={"error": {"code": "INVALID_RESULT", "message": str(exc)}},
        )

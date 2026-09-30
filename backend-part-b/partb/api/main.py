"""Part B HTTP surface: GET /health and POST /retrieve.

FastAPI validates the incoming payload against the frozen QueryAnalysis
contract (extra="forbid" rejects unknown fields) before our code runs.
No re-classification happens here: Part A's analysis is authoritative.
"""

from __future__ import annotations

from fastapi import FastAPI

from partb.contracts.models import QueryAnalysis, RetrievalResult
from partb.kb.loader import load_kb
from partb.retrieval.service import retrieve

app = FastAPI(title="Multidimensional Knowledge System — Part B", version="0.3.0")

_SERVICE = "partb-retrieval"
_VERSION = "0.3.0"


@app.get("/health")
def health() -> dict:
    kb = load_kb()
    return {
        "status": "ok",
        "service": _SERVICE,
        "version": _VERSION,
        "kb": kb.counts(),
        "kb_rejected_records": len(kb.rejected),
    }


@app.post("/retrieve")
def run_retrieve(analysis: QueryAnalysis) -> RetrievalResult:
    return retrieve(analysis)

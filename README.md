# BioXplore — Multidimensional Knowledge System

Research system for multidimensional knowledge representation and cross-domain
relationship analysis over **Astronomy/Astrophysics**, **Biology**, and
**Classical Tamil literature** (Thirukkural).

Two backend services work together over HTTP:

```
Frontend / client
      │  POST /query  {"query": "..."}
      ▼
backend-part-a  (FastAPI, port 8001)
  query understanding: input type, intent, domains, entities, dimensions
      │  POST /retrieve  (frozen QueryAnalysis contract)
      ▼
backend-part-b  (FastAPI, port 8000)
  knowledge bases + retrieval: sourced items, relationships, honest not_found
      │
      ▼
RetrievalResult → validated, assembled answer envelope back to the caller
```

## Layout

| Folder | What it is |
|---|---|
| `backend-part-a/` | Query understanding + orchestration + public API. Turns free text into a frozen `QueryAnalysis`, calls Part B, validates and assembles the answer. |
| `backend-part-b/` | Knowledge bases (astronomy, biology, Tamil) + dimension-filtered retrieval + relationship analysis. |

Both sides share **frozen contracts** (Pydantic v2, `frozen=True`, `extra="forbid"`)
— `QueryAnalysis` (A→B) and `RetrievalResult` (B→A). Part A ships a contract-parity
test that fails if the two copies ever drift.

## Running the merged system

```bash
# 1) Start Part B (retrieval service)
cd backend-part-b
python -m venv venv
venv/Scripts/pip install -r requirements.txt        # Windows
venv/Scripts/python -m uvicorn partb.api.main:app --port 8000

# 2) Start Part A (public API) — points at Part B by default
cd ../backend-part-a
python -m venv venv
venv/Scripts/pip install -r requirements.txt
venv/Scripts/python -m uvicorn parta.api.main:app --port 8001

# 3) Ask a question
curl -X POST http://127.0.0.1:8001/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is a black hole?"}'
```

- Part A: `POST /query`, `GET /health` (shows Part B reachability), docs at `/docs`
- Part B: `POST /retrieve`, `GET /health`, docs at `/docs`
- Part A can also run fully offline with `RETRIEVAL_BACKEND=stub` (no Part B needed).

## Tests

```bash
cd backend-part-b && venv/Scripts/python -m pytest partb/tests -q     # 31 tests
cd backend-part-a && venv/Scripts/python -m pytest parta/tests parta/contracts -q  # 55 tests
```

## Safety guarantees

1. Every item carries a resolvable source (DOI / URL / ISBN).
2. Unverified Tamil is unreachable — verses enter the KB only after verification
   against a cited edition.
3. Cross-domain (literature ↔ science) relationships may only be `INTERPRETATION`
   or `ANALOGY` — never presented as scientific evidence.
4. Speculation is labelled `HYPOTHESIS`; `FACT`/`EVIDENCE` claims are reserved for
   sourced, established content.
5. `not_found` is honest — unmatched queries return explanations, never fabricated data.

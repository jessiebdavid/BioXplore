# Knowledge System — Part A

Query understanding, orchestration, and HTTP API for a multidimensional
knowledge system spanning three domains: **astronomy/astrophysics**,
**biology**, and **classical Tamil literature**.

Part A is **stateless**: no database, no persistence, no knowledge of specific
facts. It classifies queries (input type, intent, domains, entities,
dimensions), calls a retriever (in-process stub or the remote Part B service
over HTTP), validates/labels the result, and assembles a structured answer.

Part B (knowledge bases + retrieval) is a separate service. The two halves
communicate **only** through the frozen Pydantic contracts in
[app/contracts](app/contracts).

## Requirements

- Python **3.11+** (developed and tested on 3.11–3.14)
- pip

## Install

```bash
cd backend-part-a
python -m venv .venv
# Windows:
.venv\Scripts\python -m pip install -e ".[dev]"
# macOS/Linux:
.venv/bin/python -m pip install -e ".[dev]"
```

Or with plain requirements:

```bash
pip install -r requirements.txt
```

## Run

```bash
# Windows:
.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
# macOS/Linux:
.venv/bin/python -m uvicorn app.main:app --reload --port 8000
```

The API is then at `http://localhost:8000`; interactive docs at
`http://localhost:8000/docs`.

## Environment variables

All settings are read with the `PKA_` prefix from env vars and/or a `.env`
file (see [.env.example](.env.example)):

| Variable | Default | Meaning |
|---|---|---|
| `PKA_MAX_QUERY_LENGTH` | `2000` | Max query length in chars (exceeded → `QUERY_TOO_LONG`) |
| `PKA_RETRIEVAL_TIMEOUT_S` | `10` | Timeout for Part B calls (seconds) |
| `PKA_RETRIEVER_BACKEND` | `stub` | `stub` (in-process fixtures) or `http` (call Part B) |
| `PKA_PART_B_BASE_URL` | `http://localhost:8001` | Part B base URL (http backend) |
| `PKA_LLM_BACKEND` | `null` | Only `null` (no-op provider) is implemented |
| `PKA_LOG_LEVEL` | `INFO` | `DEBUG` / `INFO` / `WARNING` / `ERROR` |
| `PKA_CORS_ORIGINS` | `["*"]` | JSON list of allowed CORS origins |

## API

### `POST /query`

```bash
curl -s http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Black hole vs white hole"}'
```

With options (explicit dimension override and/or item cap):

```bash
curl -s http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Thirukkural", "options": {"dimensions": ["1D","2D"], "max_items": 5}}'
```

Response shape (M8 envelope):

```json
{
  "query":    { "input_type": "...", "intent": "...", "domains": [...],
                "entities": [...], "dimensions": ["1D","3D"], "...": "..." },
  "answer": {
    "summary": "...",
    "sections": [ { "dimension": "1D", "title": "...", "items": [
        { "content": "...", "evidence_label": "FACT", "source": {...} } ] } ],
    "relationships": [ ... ],
    "comparison_table": { "A": "...", "B": "...", "aspects": [...] }
  },
  "sources":   [ ... ],
  "warnings":  [ ... ],
  "not_found": [ ... ]
}
```

- Only **activated** dimensions appear as sections.
- Each item keeps its own `evidence_label` (`FACT`/`EVIDENCE`/`INTERPRETATION`/
  `ANALOGY`/`HYPOTHESIS`); labels are never merged into one paragraph.
- `comparison_table` is present only for comparison queries.
- Empty retrieval ⇒ `not_found` populated, HTTP 200 (not an error).

### `GET /health`

```bash
curl -s http://localhost:8000/health
```

With the stub backend: `{"status": "ok"}`. With the http backend the response
also reports Part B reachability, e.g. `{"status": "ok", "part_b": "ok"}` —
Part B being down never fails this endpoint; it is reported, not raised.

## Error codes

Error envelope: `{"error": {"code": "<CODE>", "message": "..."}}`

| Code | HTTP | Meaning |
|---|---|---|
| `EMPTY_QUERY` | 400 | Query missing or whitespace-only |
| `QUERY_TOO_LONG` | 400 | Query longer than `PKA_MAX_QUERY_LENGTH` |
| `NO_DOMAIN_MATCH` | 400 | No domain lexicon matched (system never guesses) |
| `RETRIEVAL_FAILED` | 502 | Part B unreachable, timed out, or returned non-2xx |
| `INVALID_RESULT` | 502 | Part B returned a body violating Contract 2 |

## Swapping StubRetriever for HttpRetriever

One line — the backend switch:

```bash
export PKA_RETRIEVER_BACKEND=http          # default: stub
export PKA_PART_B_BASE_URL=http://localhost:8001
```

`app/retrieval/factory.py::get_retriever()` picks the implementation from that
setting; nothing else changes.

Part B contract:
- `POST /retrieve` — body: QueryAnalysis (Contract 1), response: RetrievalResult (Contract 2)
- `GET /health` — used by `/health` reporting
- Errors: HTTP status + `{"error": {"code": "...", "message": "..."}}`

## Running tests

```bash
# Windows:
.venv\Scripts\python -m pytest -q
# macOS/Linux:
.venv/bin/python -m pytest -q
```

114 tests: unit tests per pipeline module + a 14-case table-driven e2e suite
(`tests/e2e/test_cases.py`) that exercises the full API through
`httpx.ASGITransport` (no live server needed). The suite runs green with
`PKA_RETRIEVER_BACKEND=stub` and `PKA_LLM_BACKEND=null` — **zero LLM calls**.

## Architecture notes

- **Pipeline stages** (M1 normalize → M2 input type → M3 intent → M4 domains →
  M5 entities → M6 dimensions → build QueryAnalysis → retrieve → M9 validate →
  M8 assemble) each log `{stage, ms, notes}` via structlog (JSON, ISO
  timestamps) and surface in `query.analysis_meta.stage_timings_ms`.
- **M9 validation** drops items lacking `evidence_label`, drops Tamil items
  without complete source identification (`text_name` + `verse_number`),
  neutralizes "proves/proved/scientifically proven" wording when a Tamil
  source is cited, forces `HYPOTHESIS`/`INTERPRETATION`/`ANALOGY` labels on
  speculation, and adds the standing warning *"Conceptual relationships are
  not scientific evidence."* for Tamil↔science relationships.
- **Classifier rules and lexicons** live in YAML under
  [app/lexicons](app/lexicons) (loaded once at startup; no request-time file
  I/O). Matching is word-boundary aware; ambiguous terms (period, rhythm,
  cycle, network) only count alongside domain context.

## Frozen contracts — do not edit

[app/contracts](app/contracts) defines the shared wire format between Part A
and Part B (`enums.py`, `query_analysis.py`, `retrieval_result.py`). **Do not
rename, add, or remove fields.** Both services and the e2e expectations depend
on these exact shapes; any change must be coordinated as a joint contract
release. (Reconstruction note: the original pasted contract files never
arrived with the spec, so these modules were rebuilt from the spec's field
references — see the assumption notes at the top of each file.)

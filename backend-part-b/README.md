# BioXplore — Multidimensional Knowledge System (Backend Part B)

Research backend for multidimensional knowledge representation and cross-domain
relationship analysis over **Astronomy/Astrophysics**, **Biology**, and **Classical
Tamil literature**. Backend only — no UI, no chatbot.

Part A (query understanding + public API, built separately) calls this service over HTTP:

- `POST /retrieve` — body `QueryAnalysis` → response `RetrievalResult`
- `GET /health`

Both payloads use the two frozen contracts (Pydantic v2, `frozen=True`,
`extra="forbid"`). Never add, rename, or remove fields without agreement on both sides.

## Quick start

```bash
python -m venv venv
venv/Scripts/pip install -r requirements.txt      # Windows
# venv/bin/pip install -r requirements.txt        # macOS/Linux
venv/Scripts/python -m uvicorn partb.api.main:app --port 8000
venv/Scripts/python -m pytest partb/tests -q      # 31 tests
```

## Layout

```
partb/
  contracts/           Frozen enums + models (mirror of Part A's; do not edit values)
  analyzer/            LOCAL FALLBACK analyzer (raw query -> QueryAnalysis) for
                       standalone testing. Over HTTP, Part A's analysis is
                       authoritative and passes through untouched.
  kb/
    schemas.py         Internal entry/relationship models (NOT frozen contracts)
    loader.py          Validation rules; rejects bad provenance at load time
    data/              astronomy.json, biology.json, tamil.json, relationships.json
  retrieval/
    retriever.py       Dimension-filtered lexical retrieval (weighted field overlap)
    relationships.py   3D relationship lookup + cross-domain bridges
    service.py         QueryAnalysis -> RetrievalResult orchestration
  api/main.py          FastAPI app: GET /health, POST /retrieve
  tests/               Contracts, loader rules, 8 benchmark queries, HTTP behavior
```

## Guarantees

1. **Every item carries a source.** Scientific entries need a resolvable reference
   (DOI/URL/ISBN); relationships need one too.
2. **Unverified Tamil is unreachable.** Tamil entries require `verified: true` plus
   `text_name`, `verse_number`, `author`. The shipped `tamil.json` contains 5
   placeholders (verified=false) that the loader rejects, so Tamil queries honestly
   return `not_found` until verified verses are added.
3. **Cross-domain ≠ evidence.** Relationships bridging science and literature may only
   be `INTERPRETATION` or `ANALOGY`; FACT/EVIDENCE cross-domain records are rejected
   at load time. A conceptual relationship is never presented as scientific proof.
4. **Speculation is labelled.** Speculative content uses `HYPOTHESIS`
   (the enum value — there is no HYPOTHETICAL tag), `INTERPRETATION`, or `ANALOGY`.
5. **Dimensions activate only when relevant.** `dimensions=[]` searches all four with
   a warning; otherwise retrieval is scoped to activated dimensions only.
6. **`not_found` is honest.** Unmatched entities are listed; empty results are
   HTTP 200 with explanations, never 5xx.

## Adding verified Tamil verses

1. Transcribe the verse **only** from a cited printed/authoritative edition.
2. Add an entry to `partb/kb/data/tamil.json` (`verified: true`, full source —
   template in `partb/README.md`).
3. Run the tests; the loader re-validates provenance on every run.

Never fabricate or reconstruct verse text from memory. If it cannot be verified
against a citable edition, it does not go in.

## Benchmark queries

Covered in `partb/tests/test_pipeline.py`: black holes; plasma oscillation; black hole
vs white hole; Kepler's laws → orbital period; gene expression over time; mutation →
DNA → protein → function → disease progression; Thirukkural on water (honest
`not_found` until verses verified); biological rhythms ↔ orbital periods (ANALOGY
bridge, never evidence).

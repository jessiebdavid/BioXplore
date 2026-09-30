# Backend Part B — Knowledge Bases, Retrieval, Relationship Analysis

Multidimensional Knowledge System: research backend for multidimensional knowledge
representation and cross-domain relationship analysis over Astronomy/Astrophysics,
Biology, and Classical Tamil literature. Backend only — no UI.

Part A (teammate) owns query understanding and the public API. It calls this service:

- `POST /retrieve` — body: `QueryAnalysis` (Contract 1) → response: `RetrievalResult` (Contract 2)
- `GET /health`

The two contracts are frozen (`partb/contracts/`, Pydantic v2, `frozen=True`,
`extra="forbid"`). Never add, rename, or remove fields without agreement on both sides.

## Layout

```
partb/
  contracts/           Frozen enums + models (mirror of Part A's; do not edit values)
  analyzer/            LOCAL FALLBACK analyzer (raw query -> QueryAnalysis).
                       Over HTTP, Part A's analysis is authoritative and passes
                       through untouched; this exists only for standalone tests/demo.
  kb/
    schemas.py         Internal entry/relationship models (NOT frozen contracts)
    loader.py          Validation rules; rejects bad provenance at load time
    data/              astronomy.json, biology.json, tamil.json, relationships.json
  retrieval/
    retriever.py       Dimension-filtered lexical retrieval (weighted field overlap)
    relationships.py   3D relationship lookup + cross-domain bridges
    service.py         QueryAnalysis -> RetrievalResult orchestration
  api/main.py          FastAPI app: GET /health, POST /retrieve
  tests/               31 tests: contracts, loader rules, 8 benchmark queries, HTTP
```

Stack: Python 3.14, Pydantic v2, FastAPI + uvicorn, pytest. No database, no LLM.

## Guarantees (enforced by loader + tests)

1. **Every item carries a source.** Scientific entries need a resolvable reference
   (DOI/URL/ISBN); a relationship needs one too.
2. **Unverified Tamil is unreachable.** Tamil entries must be `verified: true` with
   `text_name` + `verse_number` + `author`, otherwise the loader refuses them.
   The shipped `tamil.json` contains 5 placeholders (verified=false) that are
   rejected at load; Tamil queries therefore return `not_found` honestly until
   verified verses are added.
3. **Cross-domain ≠ evidence.** A relationship bridging science and literature may
   only be `INTERPRETATION` or `ANALOGY`; FACT/EVIDENCE cross-domain records are
   rejected at load. A conceptual relationship is never presented as scientific proof.
4. **Speculation is labelled.** White holes, wormholes, Hawking evaporation are
   stored with `evidence_label: HYPOTHESIS` (enum value; there is no HYPOTHETICAL tag).
5. **Dimensions activate only when relevant.** `dimensions=[]` in the input searches
   all four and says so in `warnings`; otherwise retrieval is scoped to activated
   dimensions only.
6. **`not_found` is honest.** Entities with no support in returned items are listed
   in `not_found`; empty results are HTTP 200 with explanations, never 5xx.

## Running

```bash
# from repo root, with the project venv
venv/Scripts/python -m uvicorn partb.api.main:app --port 8000
venv/Scripts/python -m pytest partb/tests -q
```

`GET /health` returns KB counts, e.g. `{"astronomy": 21, "biology": 17, "tamil": 0,
"relationships": 14}` — `tamil: 0` while no verse is verified.

## Adding verified Tamil verses

1. Transcribe the verse **only** from a cited printed/authoritative edition.
2. Add an entry to `partb/kb/data/tamil.json`:

```json
{
  "id": "ta_kural_rain_191",
  "dimension": "1D",
  "domain": "tamil",
  "title": "நீர்பிறந்தாறும் (Kural 191)",
  "content": "<exact verse text from the cited edition>",
  "evidence_label": "FACT",
  "verified": true,
  "source": {
    "title": "Thirukkural — critical/standard edition used",
    "reference": "edition details (publisher, year, editor) or stable URL",
    "text_name": "Thirukkural",
    "verse_number": "191",
    "chapter": "11",
    "author": "Thiruvalluvar"
  },
  "words": [], "literal_meaning": "...", "translation": "...",
  "context": "...", "concepts": ["water", "rain"],
  "keywords": [], "aliases": ["kural 191", "thirukkural rain"]
}
```

3. Run `pytest partb/tests -q` — the loader re-validates provenance on every run.
   Placeholders can be deleted once real entries replace them.

Never fabricate or reconstruct verse text from memory. If it cannot be verified
against a citable edition, it does not go in.

## Retrieval semantics

- Scope = domains (from `domains[]`; all domains if empty) × dimensions (activated
  only; all four if none activated, with a warning).
- Scoring is deterministic lexical overlap with field weights
  (entities > aliases > title > concepts > keywords > content …), normalized by
  query length; ties break by id. Swap-in of embeddings later must not change contracts.
- `options.max_items` caps items (1–100, default 20); relationships are capped separately.
- `retrieval_meta` reports domains searched, dimensions activated vs searched,
  per-dimension item counts, label summary, matched terms, KB counts, elapsed ms.

## The 8 benchmark queries

Covered in `partb/tests/test_pipeline.py`: black holes; plasma oscillation;
black hole vs white hole (white-hole content HYPOTHESIS-labelled); Kepler's laws →
orbital period (FACT relationship); gene expression over time (4D); mutation → DNA →
protein → function → disease progression (chain + relationships); Thirukkural on water
(honest `not_found` until verses verified); biological rhythms ↔ orbital periods
(ANALOGY bridge, never evidence).

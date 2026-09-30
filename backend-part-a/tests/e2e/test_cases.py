"""E2E table-driven suite: 14 rows against the FastAPI app via ASGITransport.

No live server is required. Runs with RETRIEVER_BACKEND=stub and
LLM_BACKEND=null (zero LLM calls).
"""
import httpx
import pytest

from app.main import create_app

CASES = [
    # (id, query, expected_input_type, expected_domains, expected_dimensions)
    pytest.param(
        1, "Black holes", "topic", ["astronomy"], ["1D"],
        id="1-topic-astronomy",
    ),
    pytest.param(
        2, "Plasma oscillation", "keyword", ["astronomy"], ["1D"],
        id="2-keyword-astronomy",
    ),
    pytest.param(
        3, "Kepler's laws", "concept", ["astronomy"], ["1D"],
        id="3-concept-astronomy",
    ),
    pytest.param(
        4, "I want to understand how orbital periods are calculated",
        "sentence", ["astronomy"], ["1D", "2D"],
        id="4-sentence-astronomy",
    ),
    pytest.param(
        5, "What is a cosmological constant?", "question", ["astronomy"], ["1D"],
        id="5-question-astronomy",
    ),
    pytest.param(
        6, "Black hole vs white hole", "comparison", ["astronomy"], ["1D", "3D"],
        id="6-comparison-astronomy",
    ),
    pytest.param(
        7, "How are Kepler's laws related to orbital period?",
        "relationship", ["astronomy"], ["1D", "3D"],
        id="7-relationship-astronomy",
    ),
    pytest.param(
        8, "How does gene expression change over time?",
        "temporal", ["biology"], ["1D", "4D"],
        id="8-temporal-biology",
    ),
    pytest.param(
        9, "Can biological rhythms be compared conceptually with orbital periods?",
        "cross_domain", ["astronomy", "biology"], ["3D"],
        id="9-cross-domain-astro-bio",
    ),
    pytest.param(
        10,
        "How does a mutation affect DNA, protein structure, "
        "cellular function and disease progression?",
        "multidimensional", ["biology"], ["1D", "2D", "3D", "4D"],
        id="10-multidimensional-biology",
    ),
    pytest.param(
        11, "Thirukkural", "topic", ["tamil"], ["1D"],
        id="11-topic-tamil",
    ),
    pytest.param(
        12, "Nature in Tholkappiyam", "concept", ["tamil"], ["1D", "2D"],
        id="12-concept-tamil",
    ),
    pytest.param(
        13, "What does Thirukkural say about water?", "question", ["tamil"],
        ["1D", "2D"],
        id="13-question-tamil",
    ),
]

ERROR_CASES = [
    pytest.param("", "EMPTY_QUERY", id="14a-empty"),
    pytest.param("asdkjfhalskdjfh", "NO_DOMAIN_MATCH", id="14b-gibberish"),
    pytest.param("best pizza recipe", "NO_DOMAIN_MATCH", id="14c-off-topic"),
    pytest.param("a" * 3000, "QUERY_TOO_LONG", id="14d-too-long"),
]


def _client() -> httpx.AsyncClient:
    app = create_app()
    return httpx.AsyncClient(transport=httpx.ASGITransport(app=app),
                             base_url="http://test")


@pytest.mark.asyncio
@pytest.mark.parametrize("case_id,query,input_type,domains,dimensions", CASES)
async def test_pipeline_case(
    case_id: int,
    query: str,
    input_type: str,
    domains: list[str],
    dimensions: list[str],
) -> None:
    async with _client() as client:
        resp = await client.post("/query", json={"query": query})
    assert resp.status_code == 200, resp.text
    body = resp.json()

    assert body["query"]["input_type"] == input_type, query
    got_domains = [d["domain"] for d in body["query"]["domains"]]
    assert got_domains == domains, query
    assert body["query"]["dimensions"] == dimensions, query

    # Envelope invariants
    assert set(body) == {"query", "answer", "sources", "warnings", "not_found"}
    for section in body["answer"]["sections"]:
        assert section["dimension"] in dimensions
        for item in section["items"]:
            assert item["evidence_label"] is not None


@pytest.mark.asyncio
@pytest.mark.parametrize("query,expected_code", ERROR_CASES)
async def test_error_cases(query: str, expected_code: str) -> None:
    async with _client() as client:
        resp = await client.post("/query", json={"query": query})
    assert resp.status_code in (400, 502)
    error = resp.json()["error"]
    assert error["code"] == expected_code


@pytest.mark.asyncio
async def test_health() -> None:
    async with _client() as client:
        resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}

"""HTTP contract tests: what Part A actually sees on the wire."""

from __future__ import annotations

VALID_ANALYSIS = {
    "raw_query": "Black hole vs white hole",
    "normalized_query": "black hole vs white hole",
    "input_type": "comparison",
    "input_type_confidence": 0.9,
    "secondary_types": [],
    "intent": "compare",
    "domains": [
        {"domain": "astronomy", "score": 0.95},
    ],
    "entities": [
        {
            "text": "black hole",
            "normalized_name": "black hole",
            "domain": "astronomy",
            "entity_type": "object",
            "side": "A",
        },
        {
            "text": "white hole",
            "normalized_name": "white hole",
            "domain": "astronomy",
            "entity_type": "object",
            "side": "B",
        },
    ],
    "dimensions": ["1D", "3D"],
    "dimension_reasons": {
        "1D": "definitions requested",
        "3D": "comparison implies relationship analysis",
    },
    "options": {"max_items": 20},
    "language": "en",
    "warnings": [],
}


def test_health(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    assert set(body["kb"]) == {"astronomy", "biology", "tamil", "relationships"}
    assert body["kb"]["astronomy"] >= 15


def test_retrieve_valid_payload(client):
    resp = client.post("/retrieve", json=VALID_ANALYSIS)
    assert resp.status_code == 200
    body = resp.json()
    assert set(body) == {
        "items", "relationships", "not_found", "warnings", "retrieval_meta"
    }
    assert body["items"], "expected items for black hole vs white hole"
    item = body["items"][0]
    assert set(item) == {
        "id", "dimension", "domain", "title", "content",
        "evidence_label", "source", "entities",
    }
    assert set(item["source"]) == {
        "title", "reference", "text_name", "verse_number", "chapter", "author"
    }


def test_retrieve_rejects_unknown_fields(client):
    bad = dict(VALID_ANALYSIS)
    bad["mystery_field"] = 1
    resp = client.post("/retrieve", json=bad)
    assert resp.status_code == 422


def test_retrieve_rejects_bad_enum_value(client):
    bad = dict(VALID_ANALYSIS)
    bad["input_type"] = "not_a_type"
    resp = client.post("/retrieve", json=bad)
    assert resp.status_code == 422


def test_retrieve_rejects_out_of_range_options(client):
    bad = dict(VALID_ANALYSIS)
    bad["options"] = {"max_items": 500}
    resp = client.post("/retrieve", json=bad)
    assert resp.status_code == 422


def test_retrieve_response_is_contract_exact(client):
    from partb.contracts.models import RetrievalResult

    resp = client.post("/retrieve", json=VALID_ANALYSIS)
    body = resp.json()
    parsed = RetrievalResult.model_validate(body)  # must round-trip
    assert parsed.items[0].evidence_label in {"FACT", "EVIDENCE", "INTERPRETATION", "ANALOGY", "HYPOTHESIS"}

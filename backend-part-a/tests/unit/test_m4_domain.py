"""Unit tests for M4 domain scoring."""
from app.pipeline.m4_domain import score_domains


def test_astronomy_only() -> None:
    scores = score_domains("black hole")
    assert [s.domain.value for s in scores] == ["astronomy"]


def test_biology_only() -> None:
    scores = score_domains("gene expression")
    assert [s.domain.value for s in scores] == ["biology"]


def test_tamil_only() -> None:
    scores = score_domains("Thirukkural")
    assert [s.domain.value for s in scores] == ["tamil"]


def test_two_domains_sorted() -> None:
    scores = score_domains("biological rhythms and orbital periods")
    domains = [s.domain.value for s in scores]
    assert "biology" in domains and "astronomy" in domains
    assert scores == sorted(scores, key=lambda s: s.score, reverse=True)


def test_no_domain_empty_list() -> None:
    assert score_domains("best pizza recipe") == []


def test_gibberish_empty() -> None:
    assert score_domains("asdkjfhalskdjfh") == []


def test_ambiguous_term_needs_context() -> None:
    # 'rhythm' alone (ambiguous) must not produce a domain.
    assert score_domains("rhythm") == []
    # ...but with a biology disambiguator it does.
    domains = [s.domain.value for s in score_domains("biological rhythm")]
    assert "biology" in domains


def test_disambiguator_boosts() -> None:
    with_dis = score_domains("stellar cycle")
    without_dis = score_domains("cycle")
    assert any(s.domain.value == "astronomy" for s in with_dis)
    assert without_dis == []

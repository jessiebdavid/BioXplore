"""Unit tests for Modules 1-6 (input, matching, entities, classifier, intent, domains, dimensions)."""

from __future__ import annotations

import pytest

from parta.modules.input_handler import InputError, analyze_input
from parta.modules.matching import match_spans
from parta.modules.entities import extract_entities, assign_comparison_sides
from parta.modules.classifier import classify
from parta.modules.intent import detect_intent
from parta.modules.domains import detect_domains
from parta.modules.dimensions import select_dimensions
from parta.contracts.enums import Domain, Dimension, EntityType, InputType, Intent


# ---- Module 1 ---------------------------------------------------------------

def test_normalize_trims_and_collapses():
    r = analyze_input("  Black   holes??  ")
    assert r.normalized == "Black holes?"  # punctuation runs collapse to one
    assert r.ends_with_qmark is True


def test_empty_query_rejected():
    with pytest.raises(InputError) as e:
        analyze_input("   ")
    assert e.value.code == "EMPTY_QUERY"


def test_none_query_rejected():
    with pytest.raises(InputError) as e:
        analyze_input(None)
    assert e.value.code == "EMPTY_QUERY"


def test_too_long_query_rejected():
    with pytest.raises(InputError) as e:
        analyze_input("x" * 600)
    assert e.value.code == "QUERY_TOO_LONG"


def test_no_question_mark_required():
    r = analyze_input("black hole formation")
    assert r.ends_with_qmark is False


def test_language_detection():
    assert analyze_input("black holes").language == "en"
    assert analyze_input("திருக்குறள்").language == "ta"
    assert analyze_input("Thirukkural குறள்").language == "mixed"


# ---- matching ---------------------------------------------------------------

def test_exact_and_variant_matching():
    assert match_spans("black holes")[0]["term"]["name"] == "black hole"
    assert match_spans("thirukural rain")[0]["term"]["name"] == "thirukkural"
    assert match_spans("tirukkural")[0]["term"]["name"] == "thirukkural"
    assert match_spans("black holesl")[0]["term"]["name"] == "black hole"


def test_multi_word_before_single():
    hits = match_spans("plasma oscillation")
    assert len(hits) == 1
    assert hits[0]["term"]["name"] == "plasma oscillation"


def test_gibberish_matches_nothing():
    assert match_spans("best pizza recipe") == []


def test_tamil_script_matches():
    hits = match_spans("திருக்குறள்")
    assert hits and hits[0]["term"]["name"] == "thirukkural"


# ---- Module 5 ---------------------------------------------------------------

def test_entity_extraction_canonicalizes():
    ents = extract_entities("black holes and orbital period")
    names = {e.normalized_name for e in ents}
    assert names == {"black hole", "orbital period"}


def test_comparison_sides_assigned():
    q = "black hole vs white hole"
    ents = extract_entities(q)
    ents = assign_comparison_sides(q, ents)
    sides = {e.normalized_name: e.side for e in ents}
    assert sides["black hole"] == "A"
    assert sides["white hole"] == "B"


# ---- Module 2 ---------------------------------------------------------------

def _classify(q: str):
    norm = analyze_input(q)
    ents = extract_entities(norm.normalized)
    return classify(norm.normalized, norm.ends_with_qmark, norm.starts_question_word, ents), ents


def test_type_topic():
    (t, c, s), _ = _classify("Black holes")
    assert t == InputType.topic and 0 <= c <= 1


def test_type_keyword():
    (t, c, s), _ = _classify("Plasma oscillation")
    assert t == InputType.keyword


def test_type_concept():
    (t, c, s), _ = _classify("Kepler's laws")
    assert t == InputType.concept


def test_type_sentence():
    (t, c, s), _ = _classify("I want to understand how orbital periods are calculated")
    assert t == InputType.sentence


def test_type_question():
    (t, c, s), _ = _classify("What is a cosmological constant?")
    assert t == InputType.question


def test_type_comparison():
    (t, c, s), _ = _classify("Black hole vs white hole")
    assert t == InputType.comparison


def test_type_relationship():
    (t, c, s), _ = _classify("How are Kepler's laws related to orbital period?")
    assert t == InputType.relationship


def test_type_temporal():
    (t, c, s), _ = _classify("How does gene expression change over time?")
    assert t == InputType.temporal


def test_type_cross_domain():
    (t, c, s), ents = _classify("Can biological rhythms be compared conceptually with orbital periods?")
    assert t == InputType.cross_domain
    assert {e.domain for e in ents} >= {Domain.BIOLOGY, Domain.ASTRONOMY}


def test_type_multidimensional():
    (t, c, s), _ = _classify(
        "How does a mutation affect DNA, protein structure, cellular function and disease progression?"
    )
    assert t == InputType.multidimensional


# ---- Module 3 ---------------------------------------------------------------

def test_intent_define():
    norm = analyze_input("What is a cosmological constant?")
    ents = extract_entities(norm.normalized)
    assert detect_intent(InputType.question, norm.normalized, ents) == Intent.define


def test_intent_compare():
    norm = analyze_input("Black hole vs white hole")
    ents = extract_entities(norm.normalized)
    assert detect_intent(InputType.comparison, norm.normalized, ents) == Intent.compare


def test_intent_temporal():
    norm = analyze_input("How does gene expression change over time?")
    ents = extract_entities(norm.normalized)
    assert detect_intent(InputType.temporal, norm.normalized, ents) == Intent.describe_change_over_time


# ---- Module 4 ---------------------------------------------------------------

def test_domain_single():
    norm = analyze_input("black holes")
    ents = extract_entities(norm.normalized)
    scores, w = detect_domains(norm.normalized, ents)
    assert [s.domain for s in scores] == [Domain.ASTRONOMY]


def test_domain_multiple_for_cross_domain_query():
    norm = analyze_input("Can biological rhythms be compared conceptually with orbital periods?")
    ents = extract_entities(norm.normalized)
    scores, w = detect_domains(norm.normalized, ents)
    doms = {s.domain for s in scores}
    assert {Domain.BIOLOGY, Domain.ASTRONOMY} <= doms


def test_domain_none_for_gibberish():
    norm = analyze_input("best pizza recipe")
    ents = extract_entities(norm.normalized)
    scores, w = detect_domains(norm.normalized, ents)
    assert scores == []
    assert w


# ---- Module 6 ---------------------------------------------------------------

def test_dimensions_define_1d_only():
    dims, reasons = select_dimensions(
        InputType.question, Intent.define, "what is a cosmological constant?", []
    )
    assert dims == [Dimension.ONE_D]
    assert set(reasons) == {Dimension.ONE_D}


def test_dimensions_explain_1d_2d():
    dims, reasons = select_dimensions(
        InputType.question, Intent.explain, "explain black hole formation", []
    )
    assert set(dims) == {Dimension.ONE_D, Dimension.TWO_D}


def test_dimensions_relationship_1d_3d():
    dims, reasons = select_dimensions(
        InputType.relationship, Intent.find_relationship,
        "how are kepler's laws related to orbital period?", [],
    )
    assert Dimension.THREE_D in dims


def test_dimensions_cross_domain_adds_4d_for_analogy():
    dims, reasons = select_dimensions(
        InputType.cross_domain, Intent.find_relationship,
        "can biological rhythms be compared conceptually with orbital periods?", [],
    )
    assert Dimension.THREE_D in dims
    assert Dimension.FOUR_D in dims
    assert set(reasons) == set(dims)


def test_dimensions_multidimensional_all():
    dims, reasons = select_dimensions(
        InputType.multidimensional, Intent.explain, "mutation affects dna protein disease", []
    )
    assert set(dims) == {Dimension.ONE_D, Dimension.TWO_D, Dimension.THREE_D, Dimension.FOUR_D}


def test_dimensions_user_override():
    dims, reasons = select_dimensions(
        InputType.question, Intent.explain, "black holes", [],
        dimensions_hint=["1D"],
    )
    assert dims == [Dimension.ONE_D]
    assert reasons[Dimension.ONE_D] == "explicitly requested by the user"

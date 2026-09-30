"""Unit tests for M3 intent classification (first-match order matters)."""
from app.pipeline.m3_intent import classify_intent


def test_retrieve_source_beats_define() -> None:
    # 'what does X say' contains no 'what is', but ordering still guards:
    # retrieve_source must fire before interpret_meaning/define.
    assert classify_intent("What does Thirukkural say about water?").value == (
        "retrieve_source"
    )


def test_compare_beats_find_relationship() -> None:
    assert classify_intent("compare black holes and galaxies").value == "compare"


def test_find_relationship() -> None:
    assert classify_intent(
        "How are Kepler's laws related to orbital period?"
    ).value == "find_relationship"


def test_describe_change_over_time() -> None:
    assert classify_intent(
        "How does gene expression change over time?"
    ).value == "describe_change_over_time"


def test_explore_hypothesis() -> None:
    assert classify_intent("What if black holes did not exist?").value == (
        "explore_hypothesis"
    )


def test_interpret_meaning() -> None:
    # No retrieve_source cue (verse/kural/say), so meaning-regex can fire.
    assert classify_intent("What does the mantra mean?").value == (
        "interpret_meaning"
    )


def test_find_evidence() -> None:
    assert classify_intent("evidence for Hawking radiation").value == (
        "find_evidence"
    )


def test_explain() -> None:
    assert classify_intent("explain gene expression").value == "explain"


def test_define() -> None:
    assert classify_intent("What is a cosmological constant?").value == "define"


def test_default_define() -> None:
    assert classify_intent("black hole").value == "define"

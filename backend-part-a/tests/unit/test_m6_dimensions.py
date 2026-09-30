"""Unit tests for M6 dimension selection."""
from app.contracts import Dimension, InputType, Intent
from app.pipeline.m6_dimensions import select_dimensions


def test_define_1d() -> None:
    dims, reasons = select_dimensions(Intent.DEFINE, InputType.TOPIC, "black hole")
    assert dims == [Dimension.D1]
    assert "intent" in reasons


def test_explain_1d_2d() -> None:
    dims, _ = select_dimensions(Intent.EXPLAIN, InputType.SENTENCE, "explain X")
    assert [d.value for d in dims] == ["1D", "2D"]


def test_compare_1d_3d() -> None:
    dims, _ = select_dimensions(Intent.COMPARE, InputType.COMPARISON, "a vs b")
    assert [d.value for d in dims] == ["1D", "3D"]


def test_find_relationship_1d_3d() -> None:
    dims, _ = select_dimensions(
        Intent.FIND_RELATIONSHIP, InputType.RELATIONSHIP, "a related to b"
    )
    assert [d.value for d in dims] == ["1D", "3D"]


def test_temporal_1d_4d() -> None:
    dims, _ = select_dimensions(
        Intent.DESCRIBE_CHANGE_OVER_TIME, InputType.TEMPORAL, "change over time"
    )
    assert [d.value for d in dims] == ["1D", "4D"]


def test_hypothesis_1d_3d_4d() -> None:
    dims, _ = select_dimensions(
        Intent.EXPLORE_HYPOTHESIS, InputType.QUESTION, "what if X"
    )
    assert [d.value for d in dims] == ["1D", "3D", "4D"]


def test_interpret_meaning_1d_2d() -> None:
    dims, _ = select_dimensions(
        Intent.INTERPRET_MEANING, InputType.QUESTION, "meaning of X"
    )
    assert [d.value for d in dims] == ["1D", "2D"]


def test_cross_domain_replaces_with_3d() -> None:
    dims, _ = select_dimensions(
        Intent.COMPARE, InputType.CROSS_DOMAIN, "rhythms compared with periods"
    )
    assert [d.value for d in dims] == ["3D"]


def test_cross_domain_with_analogy_adds_4d() -> None:
    dims, _ = select_dimensions(
        Intent.COMPARE,
        InputType.CROSS_DOMAIN,
        "rhythms compared with periods as an analogy",
    )
    assert [d.value for d in dims] == ["3D", "4D"]


def test_multidimensional_all_four() -> None:
    dims, _ = select_dimensions(
        Intent.FIND_RELATIONSHIP, InputType.MULTIDIMENSIONAL, "a, b, c and d"
    )
    assert [d.value for d in dims] == ["1D", "2D", "3D", "4D"]


def test_speculative_trigger_forces_4d() -> None:
    dims, reasons = select_dimensions(
        Intent.DEFINE, InputType.TOPIC, "black hole might be a wormhole"
    )
    assert Dimension.D4 in dims
    assert "speculative" in reasons


def test_user_override_wins() -> None:
    dims, reasons = select_dimensions(
        Intent.DEFINE,
        InputType.TOPIC,
        "black hole",
        user_dimensions=[Dimension.D3, Dimension.D4],
    )
    assert [d.value for d in dims] == ["3D", "4D"]
    assert "user_override" in reasons


def test_retrieve_source_with_meaning_adds_2d() -> None:
    dims, _ = select_dimensions(
        Intent.RETRIEVE_SOURCE,
        InputType.QUESTION,
        "what does Thirukkural say about the meaning of water",
    )
    assert [d.value for d in dims] == ["1D", "2D"]

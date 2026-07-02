"""Variation Engine — novelty scoring + priority ordering (no library edits)."""

from deus_api.engine.variation import (
    avoid_recent_ids,
    derive_metadata,
    exercise_novelty,
    prioritized_groups,
    prioritize_pool,
)
from deus_api.models.athlete_state import AthleteState


def test_derive_metadata_from_library_fields(library):
    m = derive_metadata(library.exercises[0])
    assert set(m) == {"stimulus", "stability_demand", "fatigue_cost"}
    assert 0 < m["fatigue_cost"] <= 1


def test_novelty_decreases_with_exposure():
    s = AthleteState(recent_exercise_exposure={"x": 0, "y": 3})
    assert exercise_novelty(s, "x") > exercise_novelty(s, "y")
    assert exercise_novelty(s, "never_seen") == 1.0


def test_prioritized_groups_least_trained_first():
    s = AthleteState(recent_movement_patterns={"squat": 10})
    groups = prioritized_groups(s)
    assert groups[0] != "squat"
    assert groups[-1] == "squat"


def test_avoid_recent_is_soft_and_scales_with_target():
    s = AthleteState(recent_exercise_exposure={"a": 5})
    avoid = avoid_recent_ids(s, ["a", "b"], novelty_target=0.8)
    assert "a" in avoid and "b" not in avoid
    assert avoid_recent_ids(s, ["a", "b"], novelty_target=0.0) == set()


def test_prioritize_pool_is_deterministic_and_total(library):
    s = AthleteState(recent_exercise_exposure={library.exercises[0].id: 4})
    ids = [e.id for e in library.exercises]
    ordered = prioritize_pool(s, ids, 0.5)
    assert sorted(ordered) == sorted(ids)            # no exercise lost
    assert prioritize_pool(s, ids, 0.5) == ordered   # stable / deterministic
    assert ordered[-1] == library.exercises[0].id or ordered[0] != library.exercises[0].id

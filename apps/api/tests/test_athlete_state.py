"""Persistent athlete-state lifecycle: init → exposure → feedback."""

from conftest import make_request
from deus_api.engine.assessment import assess
from deus_api.engine.athlete_state import (
    derive_recovery_capacity,
    fold_feedback,
    load_or_init,
    update_exposure,
)
from deus_api.engine.variation import prioritize_pool
from deus_api.models.feedback import FeedbackIn


def _program_with(name: str) -> dict:
    return {"sessions": [{"blocks": [{"exercises": [{"name": name}]}]}]}


def test_load_or_init_fresh():
    s = load_or_init(None, make_request())
    assert s.cycle_count == 0
    assert s.training_age == "Intermediate"


def test_load_or_init_folds_preferences():
    req = make_request()
    req.preferences.preferred_modalities = ["sled"]
    s = load_or_init(None, req)
    assert s.preferred_modalities == ["sled"]


def test_update_exposure_increments_and_cycles(library):
    s = load_or_init(None, make_request())
    ex = library.exercises[0]
    update_exposure(s, _program_with(ex.name), library)
    assert s.cycle_count == 1
    assert s.recent_exercise_exposure.get(ex.id) == 1
    assert sum(s.recent_movement_patterns.values()) >= 1


def test_exposure_window_is_bounded_by_decay(library):
    s = load_or_init(None, make_request())
    ex = library.exercises[0]
    for _ in range(5):
        update_exposure(s, _program_with(ex.name), library)
    # decay keeps "recent" a rolling window, not unbounded accumulation
    assert s.recent_exercise_exposure[ex.id] <= 2


def test_recovery_capacity_derivation():
    assert derive_recovery_capacity(25, "Advanced") == "high"
    assert derive_recovery_capacity(70, "Beginner") == "low"
    assert derive_recovery_capacity(30, "Intermediate") == "moderate"


def test_fold_feedback_drags_compliance_and_raises_load():
    s = load_or_init(None, make_request())
    s.cycle_count = 1
    before = s.compliance_score
    fold_feedback(s, FeedbackIn(email="a@b.com", run_id="r", completion_pct=0.2, soreness=5, rpe_drift=3))
    assert s.compliance_score < before
    assert 0.0 <= s.fatigue_index <= 1.0


def test_exposure_shifts_future_selection(library):
    s = load_or_init(None, make_request())
    a = assess(make_request(), s, library)
    all_ids = [e.id for e in library.exercises]
    top = prioritize_pool(s, all_ids, a.novelty_target)[0]
    update_exposure(s, _program_with(library.by_id[top].name), library)
    assert prioritize_pool(s, all_ids, a.novelty_target)[0] != top

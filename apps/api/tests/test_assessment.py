"""Assessment Layer — deterministic abstractions, not workouts."""

from conftest import make_request
from donum_dei_api.engine.assessment import assess
from donum_dei_api.engine.athlete_state import load_or_init
from donum_dei_api.models.assessment import TrainingAssessment


def _assess(library, **kw):
    req = make_request(**kw)
    return assess(req, load_or_init(None, req), library)


def test_outputs_abstraction_not_workout(library):
    a = _assess(library)
    assert isinstance(a, TrainingAssessment)
    assert 0.0 <= a.readiness_score <= 1.0
    assert a.training_state in {"primed", "balanced", "functional_overreach", "depleted"}
    assert set(a.movement_priority)  # non-empty, ordered priorities
    assert a.summary  # human-readable coach's read


def test_fresh_athlete_is_primed_and_progresses(library):
    a = _assess(library, sleep=1, soreness=1, energy=1, stress=1)
    assert a.training_state == "primed"
    assert a.recommended_stimulus == "progressive_overload"
    assert a.progression_path == "progress"


def test_fatigued_athlete_reduces_load(library):
    a = _assess(library, sleep=5, soreness=5, energy=5, stress=5)
    assert a.readiness_score < 0.3
    assert a.recommended_stimulus in {"volume_reduction", "technical_deload"}
    assert a.progression_path == "deload"


def test_beginner_intensity_is_capped(library):
    a = _assess(library, training_age="Beginner", sleep=1, soreness=1, energy=1, stress=1)
    assert a.intensity_target != "high"  # training-age ceiling protects novices


def test_injuries_become_exclusions(library):
    a = _assess(library, injuries=["knee pain"])
    assert "front_squat" in a.exclusions


def test_determinism(library):
    a1 = _assess(library)
    a2 = _assess(library)
    assert a1.model_dump() == a2.model_dump()

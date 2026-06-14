from deus_api.engine.fatigue import (
    apply_volume_reduction,
    compute_fatigue_score,
    progression_flag,
)


def test_flag_thresholds():
    assert progression_flag(2.9) == "progress"
    assert progression_flag(3.0) == "maintain"
    assert progression_flag(3.9) == "maintain"
    assert progression_flag(4.0) == "deload"
    assert progression_flag(5.0) == "deload"


def test_volume_reduction_only_when_high():
    assert apply_volume_reduction(6, 3.9) == 6
    assert apply_volume_reduction(6, 4.0) == 4  # 30% reduction
    assert apply_volume_reduction(5, 5.0) == 3  # floor at 3


def test_score_average_clamped():
    assert compute_fatigue_score(4, 4, 4, 4) == 4.0
    assert compute_fatigue_score(1, 1, 1, 1) == 1.0
    assert compute_fatigue_score(2, 4, 2, 4) == 3.0


def test_state_model_computes_score_and_state():
    from deus_api.models.input_contract import State

    # low: all 2 → score=2.0
    s = State(sleep=2, soreness=2, energy=2, stress=2, injuries=[])
    assert s.fatigue_score == 2.0
    assert s.fatigue_state == "low"

    # moderate: all 3.5 → score=3.5
    s = State(sleep=3.5, soreness=3.5, energy=3.5, stress=3.5, injuries=[])
    assert s.fatigue_score == 3.5
    assert s.fatigue_state == "moderate"

    # high: all 4.5 → score=4.5
    s = State(sleep=4.5, soreness=4.5, energy=4.5, stress=4.5, injuries=[])
    assert s.fatigue_score == 4.5
    assert s.fatigue_state == "high"

    # mixed → correct average
    s = State(sleep=1, soreness=5, energy=2, stress=4, injuries=[])
    assert s.fatigue_score == 3.0
    assert s.fatigue_state == "moderate"

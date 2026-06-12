from deus_api.engine.fatigue import (
    apply_volume_reduction,
    fatigue_score,
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
    assert apply_volume_reduction(6, 4.0) == 4  # 30% reduction, floor
    assert apply_volume_reduction(5, 5.0) == 3  # min 3


def test_score_average_clamped():
    assert fatigue_score(4, 4, 4, 4) == 4.0
    assert fatigue_score(1, 1, 1, 1) == 1.0

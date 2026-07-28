"""engine/fatigue_model.md — deterministic fatigue rules."""

from ..models.decision import Flag

VOLUME_REDUCTION = 0.30  # >= 4.0 → reduce volume 30%; never reduce intensity


def compute_fatigue_score(sleep: float, soreness: float, energy: float, stress: float) -> float:
    """Average of 4 sub-inputs (each 1–5, where 5 = worst). Clamped to [1, 5]."""
    raw = (sleep + soreness + energy + stress) / 4
    return round(max(1.0, min(5.0, raw)), 2)


def progression_flag(score: float) -> Flag:
    if score >= 4.0:
        return "deload"
    if score >= 3.0:
        return "maintain"
    return "progress"


def apply_volume_reduction(base_budget: int, score: float) -> int:
    if score >= 4.0:
        return max(3, int(base_budget * (1 - VOLUME_REDUCTION)))
    return base_budget

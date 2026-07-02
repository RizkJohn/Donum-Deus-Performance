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


def max_high_cns_days(score: float) -> int:
    """CNS budget ceiling is 3, reduced by fatigue tier (fatigue_model.md
    CNS BUDGET): 3 low / 2 moderate / 1 high. No consecutive High days at any
    tier — enforced separately by the decision engine and QC gate."""
    if score >= 4.0:
        return 1
    if score >= 3.0:
        return 2
    return 3

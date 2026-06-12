"""engine/fatigue_model.md — deterministic fatigue rules.

NOTE (input-contract gap, see docs/ARCHITECTURE.md): the payload carries a
single precomputed fatigue_score; the model spec describes a 4-component
average (sleep/soreness/energy/stress). The averaging helper exists for when
the contract later carries sub-scores; the supplied score is authoritative.
"""

from ..models.decision import Flag

VOLUME_REDUCTION = 0.30  # >= 4.0 → reduce volume 30%; never reduce intensity


def fatigue_score(sleep: float, soreness: float, energy: float, stress: float) -> float:
    score = (sleep + soreness + energy + stress) / 4
    return max(1.0, min(5.0, score))


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

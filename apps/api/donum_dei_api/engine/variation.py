"""engine/variation_engine.md — anti-repetition / novelty layer.

Derives a variation taxonomy from existing library fields (no library-schema
change) and scores exercises by novelty against the athlete's recent exposure.
It only REORDERS / PRIORITISES within the already-safe allowed pool — it never
removes an exercise the week needs for movement coverage. Determinism holds:
same state + same library → same ordering.
"""

from ..models.athlete_state import AthleteState
from ..models.decision import COVERAGE_GROUPS
from ..models.library import ExerciseEntry

# pattern → training-stimulus category (derived, not stored in the library)
_STIMULUS = {
    "squat": "lower_strength",
    "hinge": "posterior_chain",
    "push_h": "upper_push",
    "push_v": "upper_push",
    "pull_h": "upper_pull",
    "pull_v": "upper_pull",
    "rotation": "rotational_core",
    "anti_rotation": "anti_rotation_core",
    "carry": "loaded_carry",
    "locomotion": "locomotor_capacity",
    "jump": "power",
}


def derive_metadata(entry: ExerciseEntry) -> dict:
    """Variation taxonomy derived from pattern / cns / laterality."""
    return {
        "stimulus": _STIMULUS.get(entry.pattern, "general"),
        "stability_demand": "high" if entry.laterality == "Unilateral" else "moderate",
        "fatigue_cost": 0.8 if entry.cns == "High" else 0.4,
    }


def exercise_novelty(state: AthleteState, exercise_id: str) -> float:
    """1.0 = not trained in the recent window; → 0 as exposure accumulates."""
    exposure = state.recent_exercise_exposure.get(exercise_id, 0)
    return 1.0 / (1.0 + float(exposure))


def _group_exposure(state: AthleteState, group: str) -> int:
    return sum(state.recent_movement_patterns.get(p, 0) for p in COVERAGE_GROUPS[group])


def prioritized_groups(state: AthleteState) -> list[str]:
    """Coverage groups, least-recently-trained first → movement priority."""
    return sorted(COVERAGE_GROUPS, key=lambda g: (_group_exposure(state, g), g))


def prioritize_pool(
    state: AthleteState, allowed_ids: list[str], novelty_target: float
) -> list[str]:
    """Reorder the allowed pool so novel (least-exposed) exercises come first.

    `novelty_target` ∈ [0,1] scales how hard exposure penalises an exercise.
    Stable, id-tiebroken sort → deterministic across runs.
    """
    def key(ex_id: str) -> tuple[float, str]:
        score = exercise_novelty(state, ex_id) * (0.5 + novelty_target)
        return (-score, ex_id)  # higher novelty sorts first

    return sorted(allowed_ids, key=key)


def avoid_recent_ids(
    state: AthleteState, allowed_ids: list[str], novelty_target: float
) -> set[str]:
    """Ids done recently enough to de-prioritise — a SOFT signal for the prompt,
    never a hard block (coverage always wins)."""
    if novelty_target <= 0:
        return set()
    threshold = 1.0 - novelty_target  # higher target → avoid more
    return {i for i in allowed_ids if exercise_novelty(state, i) < threshold}

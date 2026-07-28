"""engine/athlete_state.md — persistent athlete-state lifecycle.

Cycle: load_or_init → (assess → generate) → update_exposure; fold_feedback
after a training cycle. EMA updates keep the state a smooth running picture,
not a single snapshot. All functions are pure (return a new/mutated model);
persistence is the caller's job (routes/assess.py, routes/feedback.py).
"""

from ..models.athlete_state import AthleteState
from ..models.feedback import FeedbackIn
from ..models.input_contract import GenerateRequest, RecoveryCapacity
from .library_loader import Library

_EXPOSURE_DECAY = 0.5  # rolling window: prior counts halve each cycle


def _norm_fatigue(score_1_5: float) -> float:
    """Map the 1–5 fatigue score (5 = worst) to a 0–1 load index."""
    return max(0.0, min(1.0, (score_1_5 - 1.0) / 4.0))


def derive_recovery_capacity(age: float, training_age: str) -> RecoveryCapacity:
    base = {"Advanced": "high", "Intermediate": "moderate", "Beginner": "moderate"}[
        training_age
    ]
    ladder: list[RecoveryCapacity] = ["low", "moderate", "high"]
    idx = ladder.index(base)
    if age >= 50:
        idx -= 1
    if age >= 65:
        idx -= 1
    return ladder[max(0, idx)]


def load_or_init(prior: dict | None, req: GenerateRequest) -> AthleteState:
    """Rehydrate stored state (or start fresh) and fold in the current check-in."""
    state = AthleteState.model_validate(prior) if prior else AthleteState()

    prefs = req.preferences
    state.training_age = req.client_profile.training_age
    state.goal_priority = [req.goals.primary, *req.goals.secondary]
    state.movement_restrictions = list(req.state.injuries)
    state.preferred_modalities = list(prefs.preferred_modalities)
    state.exercise_aversion = list(prefs.exercise_aversions)
    state.novelty_tolerance = prefs.novelty_tolerance
    state.recovery_capacity = prefs.recovery_capacity or derive_recovery_capacity(
        req.client_profile.age, req.client_profile.training_age
    )

    acute = _norm_fatigue(req.state.fatigue_score)
    state.fatigue_index = acute if state.cycle_count == 0 else round(
        0.5 * state.fatigue_index + 0.5 * acute, 3
    )
    return state


def update_exposure(
    state: AthleteState, program: dict, library: Library
) -> AthleteState:
    """Decay the rolling window, then count this cycle's prescribed work."""
    state.recent_exercise_exposure = {
        k: v for k, v in (
            (k, int(v * _EXPOSURE_DECAY)) for k, v in state.recent_exercise_exposure.items()
        ) if v > 0
    }
    state.recent_movement_patterns = {
        k: v for k, v in (
            (k, int(v * _EXPOSURE_DECAY)) for k, v in state.recent_movement_patterns.items()
        ) if v > 0
    }
    for session in program.get("sessions", []):
        for block in session.get("blocks", []):
            for ex in block.get("exercises", []):
                entry = library.by_name.get(ex.get("name", ""))
                if entry is None:
                    continue
                state.recent_exercise_exposure[entry.id] = (
                    state.recent_exercise_exposure.get(entry.id, 0) + 1
                )
                state.recent_movement_patterns[entry.pattern] = (
                    state.recent_movement_patterns.get(entry.pattern, 0) + 1
                )
    state.cycle_count += 1
    return state


def fold_feedback(state: AthleteState, fb: FeedbackIn) -> AthleteState:
    """Reinforcement signals → next cycle's autoregulation (RedesignGuide §6)."""
    state.compliance_score = round(0.5 * state.compliance_score + 0.5 * fb.completion_pct, 3)
    # harder-than-planned sessions and high soreness raise chronic load
    bump = 0.1 * max(0.0, (fb.soreness - 3.0) / 2.0) + 0.05 * max(0.0, fb.rpe_drift)
    state.fatigue_index = round(max(0.0, min(1.0, state.fatigue_index + bump)), 3)
    return state

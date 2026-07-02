"""engine/assessment_layer.md — the Assessment Layer.

Deterministic reasoning over the validated payload + persistent AthleteState.
Outputs a `TrainingAssessment` of ABSTRACTIONS — readiness, training state,
stimulus, movement priority, novelty target, intensity range, exclusions —
NOT workouts (docs/RedesignGuide.md §4, §"Most Important Technical Insight").
The Programming Layer consumes this. Zero LLM cost; an Opus-tier model may
later narrate `summary` when the Claude provider is enabled.
"""

from ..models.assessment import IntensityTarget, Stimulus, TrainingAssessment, TrainingState
from ..models.athlete_state import AthleteState
from ..models.input_contract import GenerateRequest
from .fatigue import progression_flag
from .library_loader import Library
from .substitution import blocked_ids_for_injuries
from .variation import prioritized_groups

# intensity ladder (ascending)
_INTENSITY: list[IntensityTarget] = ["low", "moderate", "moderate-high", "high"]
_INTENSITY_RANGE = {
    "low": "RPE 5–6 · technique & positions",
    "moderate": "RPE 6–7 · ~65–75% 1RM",
    "moderate-high": "RPE 7–8 · ~75–85% 1RM",
    "high": "RPE 8–9 · ~85–92% 1RM",
}
# primary goal → base intensity index on the ladder above
_GOAL_INTENSITY = {
    "Strength": 3,
    "Athletic Performance": 2,
    "Hypertrophy": 2,
    "Fat Loss": 1,
    "General Health": 1,
}
# primary goal → movement groups to surface first
_GOAL_PRIORITY = {
    "Strength": ["squat", "hinge"],
    "Hypertrophy": ["push", "pull"],
    "Athletic Performance": ["jump", "carry"],
    "Fat Loss": ["carry", "jump"],
    "General Health": [],
}
_NOVELTY_BASE = {"low": 0.25, "medium": 0.5, "high": 0.8}
_TRAINING_AGE_CEILING = {"Beginner": 2, "Intermediate": 3, "Advanced": 3}


def _readiness(req: GenerateRequest, state: AthleteState) -> float:
    """Blend acute readiness (this check-in) with chronic load (running state)."""
    acute = 1.0 - (req.state.fatigue_score - 1.0) / 4.0   # 1 fresh → 0 fried
    chronic = 1.0 - state.fatigue_index
    return round(max(0.0, min(1.0, 0.6 * acute + 0.4 * chronic)), 2)


def _training_state(readiness: float) -> TrainingState:
    if readiness >= 0.75:
        return "primed"
    if readiness >= 0.5:
        return "balanced"
    if readiness >= 0.3:
        return "functional_overreach"
    return "depleted"


def _stimulus(flag: str, ts: TrainingState) -> Stimulus:
    if ts == "depleted":
        return "technical_deload"
    return {
        "progress": "progressive_overload",
        "maintain": "volume_maintenance",
        "deload": "volume_reduction",
    }[flag]


def _intensity(req: GenerateRequest, ts: TrainingState) -> IntensityTarget:
    idx = _GOAL_INTENSITY.get(req.goals.primary, 1)
    if ts == "functional_overreach":
        idx -= 1
    elif ts == "depleted":
        idx -= 2
    idx = min(idx, _TRAINING_AGE_CEILING[req.client_profile.training_age])
    return _INTENSITY[max(0, min(len(_INTENSITY) - 1, idx))]


def _movement_priority(req: GenerateRequest, state: AthleteState) -> list[str]:
    """Least-trained-first (exposure), then biased to the primary goal."""
    order = prioritized_groups(state)
    front = [g for g in _GOAL_PRIORITY.get(req.goals.primary, []) if g in order]
    return front + [g for g in order if g not in front]


def _novelty_target(state: AthleteState) -> float:
    base = _NOVELTY_BASE[state.novelty_tolerance]
    # the longer they train, the more variation keeps adaptation alive
    return round(min(1.0, base + min(0.2, state.cycle_count * 0.02)), 2)


def _exclusions(req: GenerateRequest, library: Library) -> list[str]:
    blocked = set(blocked_ids_for_injuries(req.state.injuries))
    for term in req.preferences.exercise_aversions:
        needle = term.strip().lower()
        if not needle:
            continue
        for e in library.exercises:
            if needle in e.name.lower() or needle in e.id:
                blocked.add(e.id)
    return sorted(blocked)


def _overload_tolerance(req: GenerateRequest, state: AthleteState, readiness: float) -> float:
    base = {"Beginner": 0.4, "Intermediate": 0.6, "Advanced": 0.8}[
        req.client_profile.training_age
    ]
    scaled = base * (0.5 + 0.5 * readiness) * (0.5 + 0.5 * state.compliance_score)
    return round(max(0.0, min(1.0, scaled)), 2)


def _summary(
    readiness: float, ts: TrainingState, stimulus: Stimulus,
    intensity: IntensityTarget, priority: list[str], novelty: float, exclusions: int,
) -> str:
    stim_human = stimulus.replace("_", " ")
    head = (
        f"Readiness {round(readiness * 100)}% — {ts.replace('_', ' ')}. "
        f"Prescribing {stim_human} at {intensity} intensity "
        f"({_INTENSITY_RANGE[intensity]}). "
        f"Movement priority: {', '.join(priority[:3])}. "
        f"Variation target {round(novelty * 100)}% to keep adaptation fresh."
    )
    if exclusions:
        head += f" {exclusions} exercise(s) excluded for injury/aversion — coverage preserved by substitution."
    return head


def assess(
    req: GenerateRequest, state: AthleteState, library: Library
) -> TrainingAssessment:
    readiness = _readiness(req, state)
    ts = _training_state(readiness)
    flag = progression_flag(req.state.fatigue_score)
    stimulus = _stimulus(flag, ts)
    intensity = _intensity(req, ts)
    priority = _movement_priority(req, state)
    novelty = _novelty_target(state)
    exclusions = _exclusions(req, library)
    return TrainingAssessment(
        readiness_score=readiness,
        training_state=ts,
        recovery_classification=state.recovery_capacity,
        overload_tolerance=_overload_tolerance(req, state, readiness),
        recommended_stimulus=stimulus,
        progression_path=flag,
        movement_priority=priority,
        novelty_target=novelty,
        intensity_target=intensity,
        intensity_range=_INTENSITY_RANGE[intensity],
        exclusions=exclusions,
        summary=_summary(readiness, ts, stimulus, intensity, priority, novelty, len(exclusions)),
    )

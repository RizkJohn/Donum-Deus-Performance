"""The deterministic, safety-critical core.

Given a validated client payload, computes the PrecomputedPlan: training-day
selection, CNS distribution (max 2 High, never consecutive, pre-sport day
Low), volume budget (fatigue-adjusted), progression flag, and the allowed
exercise pool after injury pruning. The LLM never decides any of this.

Returns EngineError({"error":"UNSATISFIABLE_CONSTRAINTS", ...}) when the
constraints cannot be satisfied — never a partial plan.
"""

from ..models.assessment import TrainingAssessment
from ..models.athlete_state import AthleteState
from ..models.decision import COVERAGE_GROUPS, PlanDay, PrecomputedPlan
from ..models.errors import EngineError
from ..models.input_contract import DAY_ORDER, GenerateRequest
from .fatigue import apply_volume_reduction, progression_flag
from .library_loader import Library
from .substitution import blocked_ids_for_injuries
from .variation import prioritize_pool

# Training days and base volume (exercises/session, <= 8) by training age.
TARGET_DAYS = {"Beginner": 3, "Intermediate": 4, "Advanced": 5}
BASE_VOLUME = {"Beginner": 5, "Intermediate": 6, "Advanced": 7}

MIN_COVERAGE_EXERCISES = len(COVERAGE_GROUPS)  # 7


def _calendar_index(day: str) -> int:
    return DAY_ORDER.index(day)


def build_plan(
    req: GenerateRequest,
    library: Library,
    assessment: TrainingAssessment | None = None,
    state: AthleteState | None = None,
) -> PrecomputedPlan | EngineError:
    """Deterministic plan. When an `assessment` + `state` are supplied (the live
    pipeline), the Variation Engine reorders the allowed pool (novel → stale,
    soft aversions last) and movement priority drives coverage-group sequencing.
    Injuries remain HARD blocks; aversions are SOFT (kept for coverage, picked
    last). All hard safety rules are unchanged. Back-compat: called with just
    (req, library) it behaves exactly as before."""
    reasons: list[str] = []

    # --- eligible training days: available minus sport days, Mon→Sun order
    sport_day_set = {d for days in req.schedule.sport_days.values() for d in days}
    eligible = [
        d for d in DAY_ORDER
        if d in set(req.schedule.available_days) and d not in sport_day_set
    ]
    if not eligible:
        return EngineError(reasons=["no available non-sport training days"])

    # --- choose training days, evenly spread across eligible days
    n = min(TARGET_DAYS[req.client_profile.training_age], len(eligible))
    if n == 1:
        chosen = [eligible[0]]
    else:
        idxs = sorted({round(i * (len(eligible) - 1) / (n - 1)) for i in range(n)})
        chosen = [eligible[i] for i in idxs]

    # --- allowed exercise pool after injury pruning
    blocked = blocked_ids_for_injuries(req.state.injuries)
    allowed = [e.id for e in library.exercises if e.id not in blocked]

    # --- weekly coverage feasibility against the allowed pool
    allowed_patterns = {library.by_id[i].pattern for i in allowed}
    for group, patterns in COVERAGE_GROUPS.items():
        if not any(p in allowed_patterns for p in patterns):
            reasons.append(
                f"movement coverage group '{group}' cannot be satisfied: "
                f"all candidate exercises are blocked by injuries {req.state.injuries}"
            )
    if reasons:
        return EngineError(reasons=reasons)

    # --- volume budget (fatigue: reduce volume, never intensity)
    budget = apply_volume_reduction(
        BASE_VOLUME[req.client_profile.training_age], req.state.fatigue_score
    )
    if n * budget < MIN_COVERAGE_EXERCISES:
        return EngineError(reasons=[
            f"{n} training day(s) x {budget} exercises/session cannot cover the "
            f"{MIN_COVERAGE_EXERCISES} required weekly movement patterns"
        ])

    # --- CNS assignment: <= 2 High, no consecutive (calendar), pre-sport Low
    pre_sport = {
        DAY_ORDER[(_calendar_index(d) - 1) % 7] for d in sport_day_set
    }
    high_days: set[str] = set()
    for day in chosen:
        if len(high_days) >= 2:
            break
        if day in pre_sport:
            continue
        idx = _calendar_index(day)
        adjacent = {DAY_ORDER[(idx - 1) % 7], DAY_ORDER[(idx + 1) % 7]}
        if adjacent & high_days:
            continue
        high_days.add(day)

    days = [
        PlanDay(
            day=d,
            cns="High" if d in high_days else "Low",
            focus="Strength & Power" if d in high_days else "Movement & Capacity",
        )
        for d in chosen
    ]

    # --- variation: reorder the allowed pool (novel first) and demote soft
    #     aversions to the tail; sequence coverage groups by movement priority.
    required_groups = list(COVERAGE_GROUPS)
    if assessment is not None and state is not None:
        ordered = prioritize_pool(state, allowed, assessment.novelty_target)
        soft_avoid = set(assessment.exclusions) & set(allowed)
        allowed = [i for i in ordered if i not in soft_avoid] + [
            i for i in ordered if i in soft_avoid
        ]
        if set(assessment.movement_priority) == set(COVERAGE_GROUPS):
            required_groups = list(assessment.movement_priority)

    return PrecomputedPlan(
        days=days,
        volume_budget=budget,
        flag=progression_flag(req.state.fatigue_score),
        allowed_exercise_ids=allowed,
        blocked_exercise_ids=sorted(blocked),
        required_groups=required_groups,
    )

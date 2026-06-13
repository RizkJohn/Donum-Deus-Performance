"""The deterministic, safety-critical core.

From a validated client payload it computes the PrecomputedPlan:
- training-day selection and CNS distribution (≤2 High, never consecutive,
  pre-sport day Low; tightened for older clients),
- the allowed exercise pool after **level gating** (training age) and
  **injury contraindication** pruning (data-driven from the library),
- a per-session exercise budget shaped by training age, the goal's volume
  bias, age, and the session-duration time cap, then reduced under fatigue,
- goal-driven per-block prescriptions (sets / reps / rest / intent) and a
  conditioning dose.

The LLM decides none of this — it only fills exercises into the slots.
Returns EngineError({"error":"UNSATISFIABLE_CONSTRAINTS", ...}) when the
constraints cannot be satisfied — never a partial plan.
"""

from ..models.decision import (
    ALLOWED_LEVELS,
    COVERAGE_GROUPS,
    BlockRx,
    PlanDay,
    PrecomputedPlan,
)
from ..models.errors import EngineError
from ..models.input_contract import DAY_ORDER, GenerateRequest
from .fatigue import apply_volume_reduction, progression_flag
from .injuries import blocked_ids_for_injuries
from .library_loader import Library
from .programming import resolve_goal

TARGET_DAYS = {"Beginner": 3, "Intermediate": 4, "Advanced": 5}
BASE_VOLUME = {"Beginner": 5, "Intermediate": 6, "Advanced": 7}

MIN_COVERAGE_EXERCISES = len(COVERAGE_GROUPS)  # 7
MAX_VOLUME = 8                                  # hard cap (engine rule)
MASTERS_AGE = 55                                # recovery-adjusted threshold
MINUTES_PER_EXERCISE = 7                         # incl. rest, for time budgeting
WARMUP_MOBILITY_MINUTES = 12


def _calendar_index(day: str) -> int:
    return DAY_ORDER.index(day)


def _time_capped_volume(session_duration: float) -> int:
    usable = max(0.0, session_duration - WARMUP_MOBILITY_MINUTES)
    return max(3, int(usable // MINUTES_PER_EXERCISE))


def build_plan(req: GenerateRequest, library: Library) -> PrecomputedPlan | EngineError:
    reasons: list[str] = []
    goal = resolve_goal(req.goals.primary)
    is_masters = req.client_profile.age >= MASTERS_AGE

    # --- eligible training days: available minus sport days, Mon→Sun order
    sport_day_set = {d for days in req.schedule.sport_days.values() for d in days}
    eligible = [
        d for d in DAY_ORDER
        if d in set(req.schedule.available_days) and d not in sport_day_set
    ]
    if not eligible:
        return EngineError(reasons=["no available non-sport training days"])

    n = min(TARGET_DAYS[req.client_profile.training_age], len(eligible))
    if n == 1:
        chosen = [eligible[0]]
    else:
        idxs = sorted({round(i * (len(eligible) - 1) / (n - 1)) for i in range(n)})
        chosen = [eligible[i] for i in idxs]

    # --- allowed pool: level gating + injury contraindications (data-driven)
    allowed_levels = set(ALLOWED_LEVELS[req.client_profile.training_age])
    blocked = blocked_ids_for_injuries(library, req.state.injuries)
    allowed = [
        e.id for e in library.exercises
        if e.level in allowed_levels and e.id not in blocked
    ]

    # --- weekly coverage feasibility against the allowed pool
    allowed_patterns = {library.by_id[i].pattern for i in allowed}
    for group, patterns in COVERAGE_GROUPS.items():
        if not any(p in allowed_patterns for p in patterns):
            reasons.append(
                f"movement coverage group '{group}' cannot be satisfied for a "
                f"{req.client_profile.training_age} client with injuries "
                f"{req.state.injuries}"
            )
    if reasons:
        return EngineError(reasons=reasons)

    # --- per-session exercise budget
    base = BASE_VOLUME[req.client_profile.training_age] * goal.volume_bias
    if is_masters:
        base *= 0.85
    budget = min(round(base), _time_capped_volume(req.schedule.session_duration), MAX_VOLUME)
    budget = apply_volume_reduction(budget, req.state.fatigue_score)
    budget = max(3, budget)
    if n * budget < MIN_COVERAGE_EXERCISES:
        return EngineError(reasons=[
            f"{n} training day(s) x {budget} exercises/session cannot cover the "
            f"{MIN_COVERAGE_EXERCISES} required weekly movement patterns"
        ])

    # --- CNS assignment: ≤2 High (≤1 for masters), no consecutive, pre-sport Low
    max_high = 1 if is_masters else 2
    pre_sport = {DAY_ORDER[(_calendar_index(d) - 1) % 7] for d in sport_day_set}
    high_days: set[str] = set()
    for day in chosen:
        if len(high_days) >= max_high:
            break
        if day in pre_sport:
            continue
        idx = _calendar_index(day)
        if {DAY_ORDER[(idx - 1) % 7], DAY_ORDER[(idx + 1) % 7]} & high_days:
            continue
        high_days.add(day)

    days = [
        PlanDay(
            day=d,
            cns="High" if d in high_days else "Low",
            focus=goal.label + (" — Power & Strength" if d in high_days
                                else " — Quality & Capacity"),
        )
        for d in chosen
    ]

    def rx(b) -> BlockRx:
        return BlockRx(sets=max(1, min(6, b.sets)), reps=b.reps, rest=b.rest, notes=b.notes)

    return PrecomputedPlan(
        days=days,
        volume_budget=budget,
        flag=progression_flag(req.state.fatigue_score),
        primary_goal=goal.label,
        prescriptions={
            "Power": rx(goal.power),
            "Strength": rx(goal.strength),
            "Accessory": rx(goal.accessory),
            "Core": rx(goal.core),
        },
        conditioning_minutes=goal.conditioning_minutes,
        allowed_levels=sorted(allowed_levels),
        allowed_exercise_ids=allowed,
        blocked_exercise_ids=sorted(blocked),
        required_groups=list(COVERAGE_GROUPS),
        strength_rep_min=goal.strength_rep_min,
        strength_rep_max=goal.strength_rep_max,
    )

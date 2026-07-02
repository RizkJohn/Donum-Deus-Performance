"""Internal deterministic plan — computed by the decision engine BEFORE the
LLM is invoked. The LLM only fills exercise slots within this skeleton; it
never decides CNS distribution, volume, coverage, or progression flags."""

from typing import Literal

from pydantic import BaseModel, ConfigDict

from .input_contract import Day
from .program import CNS

Flag = Literal["progress", "maintain", "deload"]

# Weekly movement coverage requirement, expressed as groups: each group must
# be covered by at least one exercise whose pattern is in the group.
COVERAGE_GROUPS: dict[str, tuple[str, ...]] = {
    "squat": ("squat",),
    "hinge": ("hinge",),
    "push": ("push_h", "push_v"),
    "pull": ("pull_h", "pull_v"),
    "rotation": ("rotation", "anti_rotation"),
    "carry": ("carry", "locomotion"),
    "jump": ("jump",),
}


class PlanDay(BaseModel):
    model_config = ConfigDict(extra="forbid")
    day: Day
    cns: CNS
    focus: str


class PrecomputedPlan(BaseModel):
    model_config = ConfigDict(extra="forbid")
    days: list[PlanDay]
    volume_budget: int  # max exercises per session (after fatigue reduction)
    flag: Flag
    allowed_exercise_ids: list[str]  # library minus injury-blocked, post-substitution
    blocked_exercise_ids: list[str]
    required_groups: list[str]  # keys of COVERAGE_GROUPS
    max_high_cns_days: int  # fatigue-adjusted ceiling: 3 low / 2 moderate / 1 high

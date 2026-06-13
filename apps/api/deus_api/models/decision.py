"""Internal deterministic plan — computed by the decision engine BEFORE the
LLM is invoked. The LLM only fills exercise slots within this skeleton; it
never decides CNS distribution, volume, coverage, the loading scheme, or
progression flags."""

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

# Training age -> exercise levels the client may be prescribed.
ALLOWED_LEVELS: dict[str, tuple[str, ...]] = {
    "Beginner": ("Beginner",),
    "Intermediate": ("Beginner", "Intermediate"),
    "Advanced": ("Beginner", "Intermediate", "Advanced"),
}


class PlanDay(BaseModel):
    model_config = ConfigDict(extra="forbid")
    day: Day
    cns: CNS
    focus: str


class BlockRx(BaseModel):
    model_config = ConfigDict(extra="forbid")
    sets: int
    reps: str
    rest: str
    notes: str


class PrecomputedPlan(BaseModel):
    model_config = ConfigDict(extra="forbid")
    days: list[PlanDay]
    volume_budget: int                  # max exercises per session
    flag: Flag
    primary_goal: str                   # canonical goal label
    prescriptions: dict[str, BlockRx]   # block type -> loading scheme
    conditioning_minutes: int
    allowed_levels: list[str]
    allowed_exercise_ids: list[str]     # library minus injury/level-blocked
    blocked_exercise_ids: list[str]
    required_groups: list[str]          # keys of COVERAGE_GROUPS
    # QC band for primary (Strength) block rep counts.
    strength_rep_min: int
    strength_rep_max: int

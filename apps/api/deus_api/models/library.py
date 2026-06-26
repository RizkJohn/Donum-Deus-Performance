"""Pydantic models for the exercise library + substitution rules
(derived JSON of engine/exercise_library.md and engine/substitution_rules.md)."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Pattern = Literal[
    "squat", "hinge", "push_h", "push_v", "pull_h", "pull_v",
    "rotation", "anti_rotation", "carry", "locomotion", "jump", "lateral",
]
Laterality = Literal["Unilateral", "Bilateral"]


class ExerciseEntry(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: str = Field(pattern=r"^[a-z][a-z0-9_]*$")
    name: str = Field(min_length=1)
    pattern: Pattern
    cns: Literal["High", "Low"]
    laterality: Laterality


class SubstitutionRule(BaseModel):
    model_config = ConfigDict(extra="forbid")
    primary_id: str
    alternatives: list[str]

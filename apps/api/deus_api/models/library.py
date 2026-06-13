"""Pydantic models for the exercise library + substitution rules
(derived JSON of engine/exercise_library.md and engine/substitution_rules.md).

The library schema is enriched to NASM/ACSM/NSCA-grade metadata: each entry
carries equipment, a minimum training level, primary musculature, and injury
contraindications, so the deterministic decision engine can gate selection by
training age, prune by injury, and substitute by equipment — all from data,
not hard-coded maps.
"""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Pattern = Literal[
    "squat", "hinge", "push_h", "push_v", "pull_h", "pull_v",
    "rotation", "anti_rotation", "carry", "locomotion", "jump",
]
Laterality = Literal["Unilateral", "Bilateral"]
Level = Literal["Beginner", "Intermediate", "Advanced"]
Equipment = Literal[
    "barbell", "dumbbell", "kettlebell", "machine", "cable", "bodyweight",
    "band", "medicine_ball", "trap_bar", "ez_bar", "bench", "pullup_bar",
    "box", "sled", "landmine", "suspension", "slider",
]
# Canonical injury tags (assessment injury labels normalize to these).
InjuryTag = Literal[
    "shoulder", "knee", "lower_back", "wrist", "ankle", "elbow", "hip", "neck",
]


class ExerciseEntry(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: str = Field(pattern=r"^[a-z][a-z0-9_]*$")
    name: str = Field(min_length=1)
    pattern: Pattern
    cns: Literal["High", "Low"]
    laterality: Laterality
    level: Level
    equipment: list[Equipment] = Field(min_length=1)
    muscles: list[str] = Field(min_length=1)
    contraindications: list[InjuryTag] = Field(default_factory=list)


class SubstitutionRule(BaseModel):
    model_config = ConfigDict(extra="forbid")
    primary_id: str
    alternatives: list[str]

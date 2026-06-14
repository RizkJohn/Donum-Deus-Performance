"""Pydantic mirror of engine/output_schema.md (ENFORCED).

extra="forbid" everywhere == additionalProperties:false. This is the
structural gate; semantic hard rules are enforced by engine/qc.
"""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from .input_contract import Day

CNS = Literal["High", "Low"]
BlockType = Literal["Warmup", "Power", "Strength", "Accessory", "Core", "Mobility"]
ConditioningModality = Literal[
    "carries", "locomotion", "circuits", "steady_state", "intervals", "sport_practice"
]
Intensity = Literal["low", "moderate", "high"]
ProgressionFlag = Literal["progress", "maintain", "deload"]
FatigueStateOut = Literal["low", "moderate", "high"]

BLOCK_ORDER: list[str] = ["Warmup", "Power", "Strength", "Accessory", "Core", "Mobility"]


class Exercise(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str
    sets: int = Field(ge=1, le=6)
    reps: str = Field(pattern=r"^([0-9]+(-[0-9]+)?|AMRAP|Hold [0-9]+s)$")
    rest: str = Field(pattern=r"^[0-9]+(\.[0-9]+)? ?(sec|min)$")
    load_guidance: str = Field(max_length=80)
    notes: str = Field(max_length=160)


class Block(BaseModel):
    model_config = ConfigDict(extra="forbid")
    type: BlockType
    block_intent: str = Field(min_length=5, max_length=120)
    exercises: list[Exercise]


class Session(BaseModel):
    model_config = ConfigDict(extra="forbid")
    day: Day
    session_intent: str = Field(min_length=10, max_length=200)
    blocks: list[Block]


class SplitDay(BaseModel):
    model_config = ConfigDict(extra="forbid")
    day: Day
    cns: CNS
    focus: str = Field(min_length=1)
    estimated_duration_min: int = Field(ge=15, le=120)


class ProgramSummary(BaseModel):
    model_config = ConfigDict(extra="forbid")
    week_theme: str = Field(min_length=5, max_length=100)
    training_days: int = Field(ge=1, le=7)
    fatigue_state: FatigueStateOut
    progression_flag: ProgressionFlag
    key_focuses: list[str] = Field(min_length=1, max_length=4)


class ConditioningBlock(BaseModel):
    model_config = ConfigDict(extra="forbid")
    day: Day
    modality: ConditioningModality
    duration_min: int = Field(ge=5, le=30)
    intensity: Intensity
    description: str = Field(max_length=250)


class Program(BaseModel):
    model_config = ConfigDict(extra="forbid")
    program_summary: ProgramSummary
    weekly_split: list[SplitDay]
    sessions: list[Session]
    conditioning: list[ConditioningBlock]
    flags: list[str]

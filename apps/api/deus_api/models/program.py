"""Pydantic mirror of engine/output_schema.md (ENFORCED).

extra="forbid" everywhere == additionalProperties:false. This is the
structural gate; semantic hard rules are enforced by engine/qc.
"""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from .input_contract import Day

CNS = Literal["High", "Low"]
BlockType = Literal["Warmup", "Power", "Strength", "Accessory", "Core", "Mobility"]

BLOCK_ORDER: list[str] = ["Warmup", "Power", "Strength", "Accessory", "Core", "Mobility"]


class Exercise(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str
    sets: int = Field(ge=1, le=6)
    reps: str = Field(pattern=r"^([0-9]+(-[0-9]+)?|AMRAP)$")
    rest: str = Field(pattern=r"^[0-9]+(\.[0-9]+)? ?(sec|min)$")
    notes: str = Field(max_length=120)


class Block(BaseModel):
    model_config = ConfigDict(extra="forbid")
    type: BlockType
    exercises: list[Exercise]


class Session(BaseModel):
    model_config = ConfigDict(extra="forbid")
    day: Day
    blocks: list[Block]


class SplitDay(BaseModel):
    model_config = ConfigDict(extra="forbid")
    day: Day
    cns: CNS
    focus: str = Field(min_length=1)


class Program(BaseModel):
    model_config = ConfigDict(extra="forbid")
    weekly_split: list[SplitDay]
    sessions: list[Session]
    conditioning: list
    mobility: list
    flags: list[str]

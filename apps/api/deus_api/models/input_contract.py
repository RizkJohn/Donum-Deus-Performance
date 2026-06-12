"""Pydantic mirror of engine/input_contract.md (REQUIRED, STRICT)."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Day = Literal[
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
]
TrainingAge = Literal["Beginner", "Intermediate", "Advanced"]
FatigueState = Literal["low", "moderate", "high"]

DAY_ORDER: list[str] = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
]


class ClientProfile(BaseModel):
    model_config = ConfigDict(extra="forbid")
    age: float = Field(gt=0, lt=120)
    weight: float = Field(gt=0)
    training_age: TrainingAge


class Goals(BaseModel):
    model_config = ConfigDict(extra="forbid")
    primary: str = Field(min_length=1)
    secondary: list[str]


class Schedule(BaseModel):
    model_config = ConfigDict(extra="forbid")
    available_days: list[Day]
    sport_days: dict[str, list[Day]]
    session_duration: float = Field(gt=0)


class State(BaseModel):
    model_config = ConfigDict(extra="forbid")
    fatigue_score: float = Field(ge=1, le=5)
    fatigue_state: FatigueState
    injuries: list[str]


class GenerateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    client_profile: ClientProfile
    goals: Goals
    schedule: Schedule
    state: State

"""Pydantic mirror of engine/input_contract.md (REQUIRED, STRICT)."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, computed_field

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
    sleep: float = Field(ge=1, le=5)      # 1 = excellent, 5 = terrible
    soreness: float = Field(ge=1, le=5)   # 1 = none, 5 = severe
    energy: float = Field(ge=1, le=5)     # 1 = high, 5 = depleted
    stress: float = Field(ge=1, le=5)     # 1 = calm, 5 = severe
    injuries: list[str]

    @computed_field  # type: ignore[misc]
    @property
    def fatigue_score(self) -> float:
        raw = (self.sleep + self.soreness + self.energy + self.stress) / 4
        return round(max(1.0, min(5.0, raw)), 2)

    @computed_field  # type: ignore[misc]
    @property
    def fatigue_state(self) -> FatigueState:
        if self.fatigue_score >= 4.0:
            return "high"
        if self.fatigue_score >= 3.0:
            return "moderate"
        return "low"


class GenerateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    client_profile: ClientProfile
    goals: Goals
    schedule: Schedule
    state: State

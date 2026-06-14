"""Pydantic mirror of engine/input_contract.md (REQUIRED, STRICT)."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, PrivateAttr, model_validator

Day = Literal[
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
]
TrainingAge = Literal["Beginner", "Intermediate", "Advanced", "Elite"]
FatigueState = Literal["low", "moderate", "high"]
GoalType = Literal[
    "strength", "hypertrophy", "fat_loss", "athletic_performance",
    "general_fitness", "endurance", "mobility", "rehabilitation",
]

DAY_ORDER: list[str] = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
]


class ClientProfile(BaseModel):
    model_config = ConfigDict(extra="forbid")
    age: float = Field(gt=0, lt=120)
    sex: Literal["male", "female", "other"] | None = None
    weight: float = Field(gt=0)
    height_cm: float | None = Field(default=None, gt=0)
    training_age: TrainingAge
    lifestyle: Literal["sedentary", "lightly_active", "active", "very_active"] = "active"


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

    _fatigue_score: float = PrivateAttr()
    _fatigue_state: FatigueState = PrivateAttr()

    @model_validator(mode="after")
    def _compute_fatigue(self) -> "State":
        raw = (self.sleep + self.soreness + self.energy + self.stress) / 4
        self._fatigue_score = round(max(1.0, min(5.0, raw)), 2)
        if self._fatigue_score >= 4.0:
            self._fatigue_state = "high"
        elif self._fatigue_score >= 3.0:
            self._fatigue_state = "moderate"
        else:
            self._fatigue_state = "low"
        return self

    @property
    def fatigue_score(self) -> float:
        return self._fatigue_score

    @property
    def fatigue_state(self) -> FatigueState:
        return self._fatigue_state


class History(BaseModel):
    model_config = ConfigDict(extra="forbid")
    consecutive_training_weeks: int = Field(default=0, ge=0)
    last_deload_week: str | None = None


class GenerateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    client_profile: ClientProfile
    goals: Goals
    schedule: Schedule
    state: State
    equipment: list[str] = Field(default_factory=list)
    history: History = Field(default_factory=History)

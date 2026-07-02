"""Persistent Athlete State — the single most important upgrade per
docs/RedesignGuide.md ("Do not ask Claude to remember implicitly. Maintain
structured state externally").

Keyed by athlete email, stored as a JSON blob (db.models.AthleteStateRow) and
folded forward every cycle: exposure counts drive the Variation Engine, the
fatigue index and compliance score drive autoregulation in the Assessment
Layer. All fields default so a first-time athlete initialises cleanly.
"""

from pydantic import BaseModel, ConfigDict, Field

from .input_contract import NoveltyTolerance, RecoveryCapacity, TrainingAge


class AthleteState(BaseModel):
    model_config = ConfigDict(extra="forbid")

    training_age: TrainingAge = "Intermediate"
    goal_priority: list[str] = Field(default_factory=list)
    movement_restrictions: list[str] = Field(default_factory=list)
    fatigue_index: float = Field(default=0.4, ge=0.0, le=1.0)  # running EMA, 0 fresh → 1 fried
    recovery_capacity: RecoveryCapacity = "moderate"
    exercise_aversion: list[str] = Field(default_factory=list)
    preferred_modalities: list[str] = Field(default_factory=list)
    # exposure tracking — the anti-repetition substrate
    recent_movement_patterns: dict[str, int] = Field(default_factory=dict)
    recent_exercise_exposure: dict[str, int] = Field(default_factory=dict)
    novelty_tolerance: NoveltyTolerance = "medium"
    compliance_score: float = Field(default=1.0, ge=0.0, le=1.0)
    cycle_count: int = 0

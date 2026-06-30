"""Reinforcement signals (docs/RedesignGuide.md §6).

Captured after a training cycle and folded back into AthleteState so the next
assessment autoregulates on real adherence/effort rather than intake alone.
"""

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class FeedbackIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr
    run_id: str = Field(min_length=1)
    completion_pct: float = Field(ge=0.0, le=1.0)   # fraction of prescribed work done
    rpe_drift: float = Field(default=0.0, ge=-5.0, le=5.0)  # actual − planned RPE
    soreness: float = Field(default=2.0, ge=1.0, le=5.0)
    skipped_exercises: list[str] = Field(default_factory=list)
    substitutions: list[str] = Field(default_factory=list)
    enjoyment: float = Field(default=3.0, ge=1.0, le=5.0)
    performance_note: str = Field(default="", max_length=500)

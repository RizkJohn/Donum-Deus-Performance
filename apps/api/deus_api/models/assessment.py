"""The Assessment Layer output — abstractions, not workouts.

Per docs/RedesignGuide.md ("the assessment engine should output abstractions,
constraints, priorities — not workouts"), this object is produced by
`engine/assessment.py` BEFORE any programming. It is deterministic by default
(zero LLM cost, fully testable offline); when the Claude provider is enabled an
Opus-tier model may narrate `summary`. The Programming Layer consumes it.
"""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from .decision import Flag

TrainingState = Literal["primed", "balanced", "functional_overreach", "depleted"]
Stimulus = Literal[
    "progressive_overload", "volume_maintenance", "volume_reduction", "technical_deload"
]
IntensityTarget = Literal["low", "moderate", "moderate-high", "high"]
RecoveryClass = Literal["low", "moderate", "high"]


class TrainingAssessment(BaseModel):
    model_config = ConfigDict(extra="forbid")

    readiness_score: float = Field(ge=0.0, le=1.0)
    training_state: TrainingState
    recovery_classification: RecoveryClass
    overload_tolerance: float = Field(ge=0.0, le=1.0)
    recommended_stimulus: Stimulus
    progression_path: Flag
    movement_priority: list[str]   # ordered COVERAGE_GROUPS keys (most → least)
    novelty_target: float = Field(ge=0.0, le=1.0)
    intensity_target: IntensityTarget
    intensity_range: str           # human-readable, e.g. "RPE 7–8 · ~75–85% 1RM"
    exclusions: list[str]          # blocked exercise ids (injuries + aversions)
    summary: str                   # the "coach's read" — surfaced in UI + PDF

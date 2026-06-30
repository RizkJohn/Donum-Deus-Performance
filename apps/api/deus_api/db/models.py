"""Persistence: program_runs (every generation, input + output + QC trail)
and leads (assessment funnel email capture, pointing at its run)."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    pass


class ProgramRun(Base):
    __tablename__ = "program_runs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    payload: Mapped[dict] = mapped_column(JSON)
    program: Mapped[dict] = mapped_column(JSON)  # Program or EngineError shape
    assessment: Mapped[dict | None] = mapped_column(JSON, nullable=True)  # TrainingAssessment
    provider: Mapped[str] = mapped_column(String(32))
    attempts: Mapped[int] = mapped_column(Integer)
    qc_history: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    email: Mapped[str] = mapped_column(String(320))
    run_id: Mapped[str] = mapped_column(ForeignKey("program_runs.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class AthleteStateRow(Base):
    """Persistent athlete state, one row per athlete (keyed by email). The JSON
    blob is the serialized models.athlete_state.AthleteState — folded forward
    every assessment cycle (exposure, fatigue index, compliance)."""

    __tablename__ = "athlete_states"

    email: Mapped[str] = mapped_column(String(320), primary_key=True)
    state: Mapped[dict] = mapped_column(JSON)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, onupdate=_now
    )


class Feedback(Base):
    """Reinforcement signals captured after a cycle (models.feedback.FeedbackIn)."""

    __tablename__ = "feedback"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    email: Mapped[str] = mapped_column(String(320))
    run_id: Mapped[str] = mapped_column(ForeignKey("program_runs.id"))
    signals: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

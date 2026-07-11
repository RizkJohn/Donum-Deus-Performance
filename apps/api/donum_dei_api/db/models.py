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


class User(Base):
    """An account. Deliberately NOT foreign-keyed to program_runs/leads —
    dashboard queries join on email (see routes/me.py), matching the join
    routes/assess.py already uses for GDPR export/erasure. That lets accounts
    ship without altering any existing table (SQLAlchemy `create_all` only
    creates missing tables; it can't add columns to ones that already exist
    in a live database, and there's no Alembic yet)."""

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    stripe_customer_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    stripe_subscription_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    subscription_tier: Mapped[str | None] = mapped_column(String(32), nullable=True)
    subscription_status: Mapped[str | None] = mapped_column(String(32), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

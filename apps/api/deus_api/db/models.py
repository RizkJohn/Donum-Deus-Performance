"""Persistence: program_runs (every generation, input + output + QC trail)
and leads (assessment funnel email capture, pointing at its run)."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"
    __table_args__ = (UniqueConstraint("email", name="uq_users_email"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    email: Mapped[str] = mapped_column(String(320), index=True)
    subscription_tier: Mapped[str] = mapped_column(String(32), default="free")
    stripe_customer_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    subscribed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class ProgramRun(Base):
    __tablename__ = "program_runs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    payload: Mapped[dict] = mapped_column(JSON)
    program: Mapped[dict] = mapped_column(JSON)  # Program or EngineError shape
    provider: Mapped[str] = mapped_column(String(32))
    attempts: Mapped[int] = mapped_column(Integer)
    qc_history: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    email: Mapped[str] = mapped_column(String(320))
    run_id: Mapped[str] = mapped_column(ForeignKey("program_runs.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

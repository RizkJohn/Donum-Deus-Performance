"""The offer model (docs/OFFER_MODEL.md): one complete, real program is free
for every email, no account required -- matching the free-consultation
convention in high-end coaching, not a stripped-down "trial" tier. A second
program for the same email requires an active subscription. An
UNSATISFIABLE_CONSTRAINTS result never consumes the free program -- the
engine declining to compromise isn't a delivered product."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.models import Lead, ProgramRun, User

ACTIVE_STATUSES = {"active", "trialing"}


async def has_used_free_program(db: AsyncSession, email: str) -> bool:
    programs = (
        await db.execute(
            select(ProgramRun.program)
            .join(Lead, Lead.run_id == ProgramRun.id)
            .where(Lead.email == email)
        )
    ).scalars().all()
    return any(isinstance(p, dict) and "error" not in p for p in programs)


async def has_active_subscription(db: AsyncSession, email: str) -> bool:
    user = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
    return user is not None and user.subscription_status in ACTIVE_STATUSES

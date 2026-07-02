"""The offer model (docs/OFFER_MODEL.md): one complete, real program is free
for every email, no account required -- matching the free-consultation
convention in high-end coaching, not a stripped-down "trial" tier. A second
program for the same email requires an active subscription. An
UNSATISFIABLE_CONSTRAINTS result never consumes the free program -- the
engine declining to compromise isn't a delivered product.

Abuse resistance for the free program (docs/OFFER_MODEL.md#abuse-resistance):
1. Disposable/temporary email domains are rejected outright -- there's no
   legitimate reason to use one for a product that emails you your program.
2. Gmail dot/plus-alias tricks (name@gmail.com, name+1@gmail.com,
   n.a.m.e@gmail.com all deliver to the same inbox) are collapsed to one
   identity before the free-program check, so aliasing doesn't grant a new
   free program. Plus-tags are stripped for every provider (widely honored,
   not just Gmail); dot-insensitivity is applied only for
   gmail.com/googlemail.com, since it isn't universal RFC behavior.
3. A per-IP velocity cap on free (unpaid) grants specifically -- deliberately
   generous (shared/NAT'd IPs are common) since it only throttles farming via
   many distinct real inboxes, never a paying subscriber.

The per-IP store is in-memory/per-process, same tradeoff as
middleware.RateLimitMiddleware (documented there): correct for a
single-instance deployment, resets on restart, would need a shared
(Redis-backed) store for multi-instance.
"""

import time
from collections import defaultdict
from typing import ClassVar

from disposable_email_domains import blocklist
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.models import Lead, ProgramRun, User

ACTIVE_STATUSES = {"active", "trialing"}

FREE_PROGRAMS_PER_IP_LIMIT = 3
FREE_PROGRAMS_PER_IP_WINDOW_SECONDS = 24 * 3600


def _gate_identity(email: str) -> str:
    """Canonical identity for free-program bookkeeping only -- never used for
    display, delivery, or storage. Collapses provider alias tricks so they
    can't be used to claim more than one free program."""
    local, _, domain = email.strip().lower().partition("@")
    local = local.split("+", 1)[0]
    if domain in ("gmail.com", "googlemail.com"):
        local = local.replace(".", "")
        domain = "gmail.com"
    return f"{local}@{domain}"


def is_disposable_email(email: str) -> bool:
    _, _, domain = email.strip().lower().partition("@")
    return domain in blocklist


async def has_used_free_program(db: AsyncSession, email: str) -> bool:
    identity = _gate_identity(email)
    domain = identity.rpartition("@")[2]
    rows = (
        await db.execute(
            select(Lead.email, ProgramRun.program)
            .join(ProgramRun, Lead.run_id == ProgramRun.id)
            .where(Lead.email.ilike(f"%@{domain}"))
        )
    ).all()
    return any(
        _gate_identity(lead_email) == identity and isinstance(program, dict) and "error" not in program
        for lead_email, program in rows
    )


async def has_active_subscription(db: AsyncSession, email: str) -> bool:
    identity = _gate_identity(email)
    domain = identity.rpartition("@")[2]
    users = (
        await db.execute(select(User).where(User.email.ilike(f"%@{domain}")))
    ).scalars().all()
    return any(
        _gate_identity(u.email) == identity and u.subscription_status in ACTIVE_STATUSES
        for u in users
    )


class _FreeProgramIpTracker:
    _store: ClassVar[dict[str, list[float]]] = defaultdict(list)

    @classmethod
    def limit_exceeded(cls, ip: str) -> bool:
        cutoff = time.monotonic() - FREE_PROGRAMS_PER_IP_WINDOW_SECONDS
        window = [t for t in cls._store[ip] if t > cutoff]
        cls._store[ip] = window
        return len(window) >= FREE_PROGRAMS_PER_IP_LIMIT

    @classmethod
    def record_grant(cls, ip: str) -> None:
        cls._store[ip].append(time.monotonic())

    @classmethod
    def reset(cls) -> None:
        cls._store.clear()


free_program_ip_limit_exceeded = _FreeProgramIpTracker.limit_exceeded
record_free_program_grant = _FreeProgramIpTracker.record_grant

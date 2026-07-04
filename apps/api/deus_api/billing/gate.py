"""Subscription enforcement — "first program free, adaptation paid."

Gating model (owner-approved): anyone gets their first program through the
funnel; ongoing adaptation (feedback check-ins, repeat assessments) and the
dashboard history require an account with an active subscription.

Enforcement activates only when Stripe is configured (STRIPE_SECRET_KEY
set) — same graceful pattern as routes/billing.py. Without Stripe there is
no way to subscribe, so gating would lock clients out with no path to pay.
"""

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import get_settings
from ..db.models import User

# Stripe subscription statuses that count as paying.
ACTIVE_STATUSES = {"active", "trialing"}


def enforcement_enabled() -> bool:
    return bool(get_settings().stripe_secret_key)


def is_active(user: User | None) -> bool:
    return user is not None and user.subscription_status in ACTIVE_STATUSES


async def require_active_subscription(db: AsyncSession, email: str) -> None:
    """402 unless `email` belongs to an account with an active subscription.
    No-op while enforcement is disabled (Stripe unconfigured)."""
    if not enforcement_enabled():
        return
    user = (
        await db.execute(select(User).where(User.email == email))
    ).scalar_one_or_none()
    if not is_active(user):
        web_url = get_settings().web_url.rstrip("/")
        raise HTTPException(
            status_code=402,
            detail=(
                "Ongoing adaptation requires an active subscription. "
                f"Choose a tier at {web_url}/curriculum to continue."
            ),
        )

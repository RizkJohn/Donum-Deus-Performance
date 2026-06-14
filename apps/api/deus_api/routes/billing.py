"""Stripe billing routes.

POST /v1/billing/checkout  — create Stripe Checkout session (authenticated)
POST /v1/billing/webhook   — handle Stripe events (unauthenticated, signature-verified)
"""

from datetime import datetime, timezone

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..auth.deps import get_current_user
from ..config import Settings, get_settings
from ..db.models import User
from ..db.session import get_db

router = APIRouter(prefix="/v1/billing")

_TIER_TO_PRICE_ATTR = {
    "engine": "stripe_price_engine",
    "hybrid": "stripe_price_hybrid",
    "premium": "stripe_price_premium",
}


class CheckoutRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    tier: str  # engine | hybrid | premium


@router.post("/checkout")
async def create_checkout(
    body: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    settings: Settings = Depends(get_settings),
) -> dict:
    price_attr = _TIER_TO_PRICE_ATTR.get(body.tier)
    if not price_attr:
        raise HTTPException(status_code=400, detail="Unknown tier")
    price_id = getattr(settings, price_attr, "")
    if not price_id:
        raise HTTPException(status_code=503, detail="Billing not configured")

    stripe.api_key = settings.stripe_secret_key
    session = stripe.checkout.Session.create(
        customer_email=current_user.email,
        line_items=[{"price": price_id, "quantity": 1}],
        mode="subscription",
        success_url=f"{settings.web_url}/dashboard?upgraded=1",
        cancel_url=f"{settings.web_url}/#pricing",
        metadata={"user_id": current_user.id},
    )
    return {"url": session.url}


@router.post("/webhook", status_code=200)
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")

    if settings.stripe_webhook_secret:
        try:
            stripe.api_key = settings.stripe_secret_key
            event = stripe.Webhook.construct_event(
                payload, sig, settings.stripe_webhook_secret
            )
        except stripe.error.SignatureVerificationError:
            raise HTTPException(status_code=400, detail="Invalid signature")
    else:
        import json
        event = json.loads(payload)

    if event["type"] == "checkout.session.completed":
        data = event["data"]["object"]
        user_id = (data.get("metadata") or {}).get("user_id")
        customer_id = data.get("customer")
        tier = _resolve_tier(data, settings)

        if user_id:
            user = await db.get(User, user_id)
        else:
            email = data.get("customer_email")
            result = await db.execute(select(User).where(User.email == email))
            user = result.scalar_one_or_none()

        if user:
            user.stripe_customer_id = customer_id
            user.subscription_tier = tier
            user.subscribed_at = datetime.now(timezone.utc)
            await db.commit()

    elif event["type"] == "customer.subscription.deleted":
        customer_id = event["data"]["object"].get("customer")
        if customer_id:
            result = await db.execute(
                select(User).where(User.stripe_customer_id == customer_id)
            )
            user = result.scalar_one_or_none()
            if user:
                user.subscription_tier = "free"
                user.subscribed_at = None
                await db.commit()

    return {"status": "ok"}


def _resolve_tier(session_data: dict, settings: Settings) -> str:
    """Map Stripe price ID back to our tier name."""
    price_map = {
        settings.stripe_price_engine: "engine",
        settings.stripe_price_hybrid: "hybrid",
        settings.stripe_price_premium: "premium",
    }
    items = (session_data.get("line_items") or {}).get("data", [])
    if items:
        price_id = items[0].get("price", {}).get("id", "")
        return price_map.get(price_id, "engine")
    return "engine"

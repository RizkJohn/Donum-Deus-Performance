"""Stripe subscription billing.

POST /v1/billing/checkout — start a subscription for the current tier.
POST /v1/billing/portal   — manage/cancel an existing subscription.
POST /v1/billing/webhook  — Stripe's source of truth for subscription state.

All three return a clear 400 rather than an SDK exception when Stripe env
vars are unset, so the rest of the app runs fine without a Stripe account.
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, ConfigDict
from sqlalchemy.ext.asyncio import AsyncSession

from ..auth.deps import get_current_user
from ..billing import client as billing_client
from ..config import get_settings
from ..db.models import User
from ..db.session import get_db
from ..models.user import SubscriptionTier

router = APIRouter()


def _require_stripe_configured() -> None:
    if not get_settings().stripe_secret_key:
        raise HTTPException(status_code=400, detail="Billing is not configured yet.")


class CheckoutRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    tier: SubscriptionTier


@router.post("/v1/billing/checkout")
async def checkout(req: CheckoutRequest, user: User = Depends(get_current_user)) -> dict:
    _require_stripe_configured()
    settings = get_settings()
    price_id = billing_client.price_id_for_tier(settings, req.tier)
    if not price_id:
        raise HTTPException(
            status_code=400, detail=f"No Stripe price configured for tier '{req.tier}'."
        )
    session = billing_client.create_checkout_session(
        settings,
        price_id=price_id,
        customer_email=user.email,
        customer_id=user.stripe_customer_id,
        metadata={"user_id": user.id, "tier": req.tier},
        success_url=f"{settings.web_url}/dashboard?checkout=success",
        cancel_url=f"{settings.web_url}/curriculum?checkout=cancelled",
    )
    return {"url": session.url}


@router.post("/v1/billing/portal")
async def portal(user: User = Depends(get_current_user)) -> dict:
    _require_stripe_configured()
    if not user.stripe_customer_id:
        raise HTTPException(status_code=400, detail="No billing account found yet.")
    settings = get_settings()
    session = billing_client.create_portal_session(
        settings,
        customer_id=user.stripe_customer_id,
        return_url=f"{settings.web_url}/dashboard",
    )
    return {"url": session.url}


@router.post("/v1/billing/webhook")
async def webhook(request: Request, db: AsyncSession = Depends(get_db)) -> dict:
    settings = get_settings()
    if not settings.stripe_webhook_secret:
        raise HTTPException(status_code=400, detail="Webhook is not configured.")

    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")
    try:
        event = billing_client.construct_webhook_event(
            settings, payload=payload, sig_header=sig_header
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid webhook signature.")

    event_type = event["type"]
    obj = event["data"]["object"]

    if event_type == "checkout.session.completed":
        user_id = obj.get("metadata", {}).get("user_id")
        user = await db.get(User, user_id) if user_id else None
        if user is not None:
            user.stripe_customer_id = obj.get("customer") or user.stripe_customer_id
            user.stripe_subscription_id = obj.get("subscription") or user.stripe_subscription_id
            user.subscription_tier = obj.get("metadata", {}).get("tier", user.subscription_tier)
            user.subscription_status = "active"
            await db.commit()

    elif event_type in ("customer.subscription.updated", "customer.subscription.deleted"):
        user_id = obj.get("metadata", {}).get("user_id")
        user = await db.get(User, user_id) if user_id else None
        if user is not None:
            user.subscription_status = obj.get("status", user.subscription_status)
            tier = obj.get("metadata", {}).get("tier")
            if tier:
                user.subscription_tier = tier
            await db.commit()

    return {"received": True}

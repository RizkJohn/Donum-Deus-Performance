"""Thin wrapper around the Stripe SDK — isolates the one place that touches
`stripe.*` so tests can monkeypatch this module instead of the SDK itself.

Tier <-> Price ID is resolved from Settings (STRIPE_PRICE_FOUNDATION etc.) so
adding/renaming a tier never means touching this file.
"""

import stripe

from ..config import Settings

_PRICE_FIELD = {
    "foundation": "stripe_price_foundation",
    "practice": "stripe_price_practice",
    "stewardship": "stripe_price_stewardship",
}


def price_id_for_tier(settings: Settings, tier: str) -> str | None:
    field = _PRICE_FIELD.get(tier)
    return (getattr(settings, field) if field else None) or None


def create_checkout_session(
    settings: Settings,
    *,
    price_id: str,
    customer_email: str,
    customer_id: str | None,
    metadata: dict,
    success_url: str,
    cancel_url: str,
):
    stripe.api_key = settings.stripe_secret_key
    kwargs: dict = {
        "mode": "subscription",
        "line_items": [{"price": price_id, "quantity": 1}],
        "success_url": success_url,
        "cancel_url": cancel_url,
        "metadata": metadata,
        "subscription_data": {"metadata": metadata},
    }
    if customer_id:
        kwargs["customer"] = customer_id
    else:
        kwargs["customer_email"] = customer_email
    return stripe.checkout.Session.create(**kwargs)


def create_portal_session(settings: Settings, *, customer_id: str, return_url: str):
    stripe.api_key = settings.stripe_secret_key
    return stripe.billing_portal.Session.create(customer=customer_id, return_url=return_url)


def construct_webhook_event(settings: Settings, *, payload: bytes, sig_header: str):
    stripe.api_key = settings.stripe_secret_key
    return stripe.Webhook.construct_event(payload, sig_header, settings.stripe_webhook_secret)

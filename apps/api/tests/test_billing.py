"""Billing tests never touch the network — `donum_dei_api.billing.client`'s
functions (the only place that calls the Stripe SDK) are monkeypatched, so
these assert on request/response shape and DB side effects, not Stripe
itself."""

import pytest

from donum_dei_api.config import get_settings


class _FakeSession:
    def __init__(self, url: str):
        self.url = url


async def _signed_up(client, email="billing@example.com"):
    r = await client.post("/v1/auth/signup", json={"email": email, "password": "correcthorse"})
    return r.json()["token"]


@pytest.mark.asyncio
async def test_checkout_requires_auth(client):
    r = await client.post("/v1/billing/checkout", json={"tier": "foundation"})
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_checkout_400_when_stripe_not_configured(client):
    token = await _signed_up(client)
    r = await client.post(
        "/v1/billing/checkout",
        json={"tier": "foundation"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 400


@pytest.mark.asyncio
async def test_checkout_400_when_tier_price_missing(client, monkeypatch):
    monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_test_x")
    get_settings.cache_clear()
    token = await _signed_up(client, "notier@example.com")
    r = await client.post(
        "/v1/billing/checkout",
        json={"tier": "foundation"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 400
    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_checkout_success_returns_stripe_url(client, monkeypatch):
    monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_test_x")
    monkeypatch.setenv("STRIPE_PRICE_FOUNDATION", "price_foundation_123")
    get_settings.cache_clear()

    from donum_dei_api.billing import client as billing_client

    captured = {}

    def fake_create_checkout_session(settings, **kwargs):
        captured.update(kwargs)
        return _FakeSession("https://checkout.stripe.com/fake-session")

    monkeypatch.setattr(billing_client, "create_checkout_session", fake_create_checkout_session)

    token = await _signed_up(client, "checkout@example.com")
    r = await client.post(
        "/v1/billing/checkout",
        json={"tier": "foundation"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    assert r.json()["url"] == "https://checkout.stripe.com/fake-session"
    assert captured["price_id"] == "price_foundation_123"
    assert captured["metadata"]["tier"] == "foundation"
    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_portal_requires_existing_customer(client, monkeypatch):
    monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_test_x")
    get_settings.cache_clear()
    token = await _signed_up(client, "noportal@example.com")
    r = await client.post("/v1/billing/portal", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 400
    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_webhook_checkout_completed_updates_user(client, monkeypatch):
    monkeypatch.setenv("STRIPE_WEBHOOK_SECRET", "whsec_x")
    get_settings.cache_clear()

    token = await _signed_up(client, "webhook@example.com")
    me = await client.get("/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    user_id = me.json()["id"]

    from donum_dei_api.billing import client as billing_client

    fake_event = {
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "metadata": {"user_id": user_id, "tier": "practice"},
                "customer": "cus_fake123",
                "subscription": "sub_fake123",
            }
        },
    }
    monkeypatch.setattr(
        billing_client, "construct_webhook_event", lambda *a, **k: fake_event
    )

    r = await client.post(
        "/v1/billing/webhook", content=b"{}", headers={"stripe-signature": "t=1,v1=fake"}
    )
    assert r.status_code == 200

    me_after = await client.get("/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    body = me_after.json()
    assert body["subscription_tier"] == "practice"
    assert body["subscription_status"] == "active"

    # Portal now works since the webhook attached a stripe_customer_id.
    monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_test_x")
    get_settings.cache_clear()
    monkeypatch.setattr(
        billing_client, "create_portal_session",
        lambda settings, **kwargs: _FakeSession("https://billing.stripe.com/fake-portal"),
    )
    portal = await client.post("/v1/billing/portal", headers={"Authorization": f"Bearer {token}"})
    assert portal.status_code == 200
    assert portal.json()["url"] == "https://billing.stripe.com/fake-portal"
    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_webhook_invalid_signature_rejected(client, monkeypatch):
    monkeypatch.setenv("STRIPE_WEBHOOK_SECRET", "whsec_x")
    get_settings.cache_clear()

    from donum_dei_api.billing import client as billing_client

    def raise_error(*a, **k):
        raise ValueError("bad signature")

    monkeypatch.setattr(billing_client, "construct_webhook_event", raise_error)

    r = await client.post(
        "/v1/billing/webhook", content=b"{}", headers={"stripe-signature": "bad"}
    )
    assert r.status_code == 400
    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_webhook_400_when_not_configured(client):
    r = await client.post("/v1/billing/webhook", content=b"{}")
    assert r.status_code == 400

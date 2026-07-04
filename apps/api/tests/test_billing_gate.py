"""Subscription enforcement: first program free, adaptation paid.
Enforcement activates only when Stripe is configured (STRIPE_SECRET_KEY)."""

import pytest
from conftest import make_request
from sqlalchemy import select


def _enable_enforcement(monkeypatch):
    from deus_api.config import get_settings

    monkeypatch.setattr(get_settings(), "stripe_secret_key", "sk_test_gate")


async def _subscribe(email: str, status: str = "active"):
    from deus_api.db import session as db_session
    from deus_api.db.models import User

    async with db_session._sessionmaker() as db:
        user = (await db.execute(select(User).where(User.email == email))).scalar_one()
        user.subscription_status = status
        await db.commit()


@pytest.mark.asyncio
async def test_everything_open_while_stripe_unconfigured(client):
    email = "openaccess@example.com"
    r1 = await client.post("/v1/assess", json={"email": email, "payload": make_request().model_dump()})
    r2 = await client.post("/v1/assess", json={"email": email, "payload": make_request().model_dump()})
    assert r1.status_code == r2.status_code == 200
    fb = await client.post("/v1/feedback", json={"email": email, "run_id": r1.json()["id"], "completion_pct": 1.0})
    assert fb.status_code == 200


@pytest.mark.asyncio
async def test_first_program_free_repeat_gated(client, monkeypatch):
    _enable_enforcement(monkeypatch)
    email = "funnel@example.com"
    r1 = await client.post("/v1/assess", json={"email": email, "payload": make_request().model_dump()})
    assert r1.status_code == 200  # first is always free

    r2 = await client.post("/v1/assess", json={"email": email, "payload": make_request().model_dump()})
    assert r2.status_code == 402
    assert "subscription" in r2.json()["detail"].lower()


@pytest.mark.asyncio
async def test_feedback_gated_then_allowed_when_subscribed(client, monkeypatch):
    _enable_enforcement(monkeypatch)
    email = "checkin@example.com"
    r = await client.post("/v1/assess", json={"email": email, "payload": make_request().model_dump()})
    run_id = r.json()["id"]

    fb = await client.post("/v1/feedback", json={"email": email, "run_id": run_id, "completion_pct": 1.0})
    assert fb.status_code == 402

    await client.post("/v1/auth/signup", json={"email": email, "password": "hunter2hunter2"})
    await _subscribe(email)
    fb = await client.post("/v1/feedback", json={"email": email, "run_id": run_id, "completion_pct": 1.0})
    assert fb.status_code == 200


@pytest.mark.asyncio
async def test_subscribed_repeat_assessment_allowed(client, monkeypatch):
    _enable_enforcement(monkeypatch)
    email = "member2@example.com"
    await client.post("/v1/auth/signup", json={"email": email, "password": "hunter2hunter2"})
    await _subscribe(email, status="trialing")  # trialing counts as active

    r1 = await client.post("/v1/assess", json={"email": email, "payload": make_request().model_dump()})
    r2 = await client.post("/v1/assess", json={"email": email, "payload": make_request().model_dump()})
    assert r1.status_code == r2.status_code == 200


@pytest.mark.asyncio
async def test_dashboard_gated_without_subscription(client, monkeypatch):
    _enable_enforcement(monkeypatch)
    email = "windowshopper@example.com"
    s = await client.post("/v1/auth/signup", json={"email": email, "password": "hunter2hunter2"})
    token = s.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    r = await client.get("/v1/me/programs", headers=headers)
    assert r.status_code == 402

    await _subscribe(email)
    r = await client.get("/v1/me/programs", headers=headers)
    assert r.status_code == 200

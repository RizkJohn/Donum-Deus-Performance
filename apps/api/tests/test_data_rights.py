"""GDPR data-rights endpoints: token-gated export/erasure, account deletion,
Stripe-aware cancellation, and the production JWT-secret guard."""

import re

import jwt as pyjwt
import pytest
from sqlalchemy import select

from conftest import make_request

_TOKEN_RE = re.compile(r'<code data-token[^>]*>([^<]+)</code>')


def token_from_outbox(outbox: list[dict], email: str) -> str:
    """Latest confirmation code sent to `email` (see email/templates.py)."""
    for message in reversed(outbox):
        if message["to"] == email:
            match = _TOKEN_RE.search(message["html"])
            if match:
                return match.group(1)
    raise AssertionError(f"no data-request email to {email} in outbox")


async def _request_token(client, email: str, action: str) -> str:
    from deus_api.email.factory import get_email_provider

    r = await client.post("/v1/data/request", json={"email": email, "action": action})
    assert r.status_code == 200
    return token_from_outbox(get_email_provider().outbox, email)


@pytest.mark.asyncio
async def test_export_requires_token_not_email(client):
    email = "export@example.com"
    await client.post("/v1/assess", json={"email": email, "payload": make_request().model_dump()})

    # The old unauthenticated contract is gone.
    r = await client.get("/v1/data", params={"email": email})
    assert r.status_code == 422

    token = await _request_token(client, email, "export")
    r = await client.get("/v1/data", params={"token": token})
    assert r.status_code == 200
    body = r.json()
    assert body["email"] == email
    assert body["record_count"] >= 1
    assert body["athlete_state"] is not None


@pytest.mark.asyncio
async def test_export_token_cannot_erase(client):
    email = "purpose@example.com"
    token = await _request_token(client, email, "export")
    d = await client.request("DELETE", "/v1/data", json={"token": token})
    assert d.status_code == 401


@pytest.mark.asyncio
async def test_garbage_and_expired_tokens_rejected(client, settings):
    r = await client.get("/v1/data", params={"token": "not-a-token"})
    assert r.status_code == 401

    expired = pyjwt.encode(
        {"email": "x@example.com", "purpose": "data-export", "exp": 0},
        settings.auth_jwt_secret,
        algorithm="HS256",
    )
    r = await client.get("/v1/data", params={"token": expired})
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_request_response_identical_for_unknown_email(client):
    known = "known@example.com"
    await client.post("/v1/assess", json={"email": known, "payload": make_request().model_dump()})

    r1 = await client.post("/v1/data/request", json={"email": known, "action": "export"})
    r2 = await client.post("/v1/data/request", json={"email": "stranger@example.com", "action": "export"})
    assert r1.status_code == r2.status_code == 200
    assert r1.json() == r2.json()  # no enumeration signal


@pytest.mark.asyncio
async def test_erasure_deletes_account_and_cancels_subscription(client, monkeypatch):
    from deus_api.billing import client as billing_client
    from deus_api.config import get_settings
    from deus_api.db import session as db_session
    from deus_api.db.models import User

    email = "member@example.com"
    s = await client.post("/v1/auth/signup", json={"email": email, "password": "hunter2hunter2"})
    assert s.status_code == 201
    await client.post("/v1/assess", json={"email": email, "payload": make_request().model_dump()})

    # Give the account a live subscription so the cancel path runs.
    async with db_session._sessionmaker() as db:
        user = (await db.execute(select(User).where(User.email == email))).scalar_one()
        user.stripe_subscription_id = "sub_test_123"
        await db.commit()

    cancelled: list[str] = []
    monkeypatch.setattr(get_settings(), "stripe_secret_key", "sk_test_x")
    monkeypatch.setattr(
        billing_client,
        "cancel_subscription",
        lambda settings, *, subscription_id: cancelled.append(subscription_id),
    )

    token = await _request_token(client, email, "erase")
    d = await client.request("DELETE", "/v1/data", json={"token": token})
    assert d.status_code == 200
    body = d.json()
    assert body["deleted_account"] == 1
    assert body["deleted_programs"] >= 1
    assert cancelled == ["sub_test_123"]

    # The account is gone, not just the funnel data.
    login = await client.post("/v1/auth/login", json={"email": email, "password": "hunter2hunter2"})
    assert login.status_code == 401


@pytest.mark.asyncio
async def test_erasure_aborts_if_subscription_cancel_fails(client, monkeypatch):
    from deus_api.billing import client as billing_client
    from deus_api.config import get_settings

    email = "sticky@example.com"
    await client.post("/v1/auth/signup", json={"email": email, "password": "hunter2hunter2"})

    from deus_api.db import session as db_session
    from deus_api.db.models import User

    async with db_session._sessionmaker() as db:
        user = (await db.execute(select(User).where(User.email == email))).scalar_one()
        user.stripe_subscription_id = "sub_wont_die"
        await db.commit()

    monkeypatch.setattr(get_settings(), "stripe_secret_key", "sk_test_x")

    def _boom(settings, *, subscription_id):
        raise RuntimeError("stripe down")

    monkeypatch.setattr(billing_client, "cancel_subscription", _boom)

    token = await _request_token(client, email, "erase")
    d = await client.request("DELETE", "/v1/data", json={"token": token})
    assert d.status_code == 502

    # Nothing was deleted — the client can still log in and retry.
    login = await client.post("/v1/auth/login", json={"email": email, "password": "hunter2hunter2"})
    assert login.status_code == 200


@pytest.mark.asyncio
async def test_data_token_is_not_a_session(client):
    email = "sneaky@example.com"
    await client.post("/v1/auth/signup", json={"email": email, "password": "hunter2hunter2"})
    token = await _request_token(client, email, "export")

    r = await client.get("/v1/me/programs", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 401


def test_create_app_refuses_default_secret_on_postgres(monkeypatch):
    from deus_api import config
    from deus_api.main import create_app

    monkeypatch.setenv("DATABASE_URL", "postgresql+asyncpg://u:p@db:5432/prod")
    config.get_settings.cache_clear()
    try:
        with pytest.raises(RuntimeError, match="AUTH_JWT_SECRET"):
            create_app()
        # With a real secret set, the same environment boots.
        monkeypatch.setenv("AUTH_JWT_SECRET", "a-real-secret")
        config.get_settings.cache_clear()
        create_app()
    finally:
        config.get_settings.cache_clear()

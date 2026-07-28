import pytest

# `client` fixture lives in conftest.py.


@pytest.mark.asyncio
async def test_signup_returns_token_and_user(client):
    r = await client.post(
        "/v1/auth/signup", json={"email": "new@example.com", "password": "correcthorse"}
    )
    assert r.status_code == 201
    body = r.json()
    assert body["token"]
    assert body["user"]["email"] == "new@example.com"
    assert body["user"]["subscription_tier"] is None


@pytest.mark.asyncio
async def test_signup_sends_welcome_email(client):
    from donum_dei_api.email.factory import get_email_provider

    await client.post(
        "/v1/auth/signup", json={"email": "welcome@example.com", "password": "correcthorse"}
    )
    outbox = get_email_provider().outbox
    assert any(e["to"] == "welcome@example.com" for e in outbox)


@pytest.mark.asyncio
async def test_signup_duplicate_email_conflicts(client):
    payload = {"email": "dupe@example.com", "password": "correcthorse"}
    r1 = await client.post("/v1/auth/signup", json=payload)
    assert r1.status_code == 201
    r2 = await client.post("/v1/auth/signup", json=payload)
    assert r2.status_code == 409


@pytest.mark.asyncio
async def test_signup_rejects_short_password(client):
    r = await client.post(
        "/v1/auth/signup", json={"email": "short@example.com", "password": "abc"}
    )
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_login_success_and_failure(client):
    payload = {"email": "login@example.com", "password": "correcthorse"}
    await client.post("/v1/auth/signup", json=payload)

    ok = await client.post("/v1/auth/login", json=payload)
    assert ok.status_code == 200
    assert ok.json()["token"]

    bad = await client.post(
        "/v1/auth/login", json={"email": "login@example.com", "password": "wrongpass"}
    )
    assert bad.status_code == 401

    unknown = await client.post(
        "/v1/auth/login", json={"email": "ghost@example.com", "password": "whatever"}
    )
    assert unknown.status_code == 401


@pytest.mark.asyncio
async def test_me_requires_bearer_token(client):
    r = await client.get("/v1/auth/me")
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_me_returns_current_user(client):
    payload = {"email": "me@example.com", "password": "correcthorse"}
    signup = await client.post("/v1/auth/signup", json=payload)
    token = signup.json()["token"]

    r = await client.get("/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["email"] == "me@example.com"


@pytest.mark.asyncio
async def test_me_rejects_garbage_token(client):
    r = await client.get("/v1/auth/me", headers={"Authorization": "Bearer not-a-real-token"})
    assert r.status_code == 401

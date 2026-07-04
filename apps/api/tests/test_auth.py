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
    from deus_api.email.factory import get_email_provider

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


# --- password reset (token-gated, mirrors the GDPR data-rights flow) ---


@pytest.mark.asyncio
async def test_password_reset_flow(client):
    from deus_api.email.factory import get_email_provider
    from test_data_rights import token_from_outbox

    email = "forgetful@example.com"
    await client.post("/v1/auth/signup", json={"email": email, "password": "originalpass"})

    r = await client.post("/v1/auth/reset-request", json={"email": email})
    assert r.status_code == 200
    token = token_from_outbox(get_email_provider().outbox, email)

    r = await client.post("/v1/auth/reset", json={"token": token, "new_password": "freshpassword"})
    assert r.status_code == 200

    old = await client.post("/v1/auth/login", json={"email": email, "password": "originalpass"})
    assert old.status_code == 401
    new = await client.post("/v1/auth/login", json={"email": email, "password": "freshpassword"})
    assert new.status_code == 200


@pytest.mark.asyncio
async def test_reset_request_uniform_for_unknown_email(client):
    from deus_api.email.factory import get_email_provider

    known = "resetme@example.com"
    await client.post("/v1/auth/signup", json={"email": known, "password": "originalpass"})

    r1 = await client.post("/v1/auth/reset-request", json={"email": known})
    r2 = await client.post("/v1/auth/reset-request", json={"email": "ghost@example.com"})
    assert r1.status_code == r2.status_code == 200
    assert r1.json() == r2.json()
    # ...but no email actually goes to the unknown address.
    outbox = get_email_provider().outbox
    assert not any(e["to"] == "ghost@example.com" for e in outbox)


@pytest.mark.asyncio
async def test_reset_rejects_garbage_and_wrong_purpose_tokens(client):
    from deus_api.auth.tokens import issue_data_token

    email = "crossed@example.com"
    await client.post("/v1/auth/signup", json={"email": email, "password": "originalpass"})

    r = await client.post("/v1/auth/reset", json={"token": "garbage", "new_password": "freshpassword"})
    assert r.status_code == 401

    # A data-erasure token must not reset a password (and vice versa).
    erase_token = issue_data_token(email, "erase")
    r = await client.post("/v1/auth/reset", json={"token": erase_token, "new_password": "freshpassword"})
    assert r.status_code == 401

    reset_token = issue_data_token(email, "password-reset")
    d = await client.request("DELETE", "/v1/data", json={"token": reset_token})
    assert d.status_code == 401

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


@pytest.mark.asyncio
async def test_password_reset_request_is_202_for_unknown_email(client):
    # Never reveals whether the account exists.
    r = await client.post("/v1/auth/password-reset/request", json={"email": "ghost@example.com"})
    assert r.status_code == 202


@pytest.mark.asyncio
async def test_password_reset_request_sends_email_for_known_account(client):
    from deus_api.email.factory import get_email_provider

    payload = {"email": "reset@example.com", "password": "correcthorse"}
    await client.post("/v1/auth/signup", json=payload)

    r = await client.post("/v1/auth/password-reset/request", json={"email": "reset@example.com"})
    assert r.status_code == 202
    outbox = get_email_provider().outbox
    assert any(e["to"] == "reset@example.com" and "Reset" in e["subject"] for e in outbox)


@pytest.mark.asyncio
async def test_password_reset_confirm_full_flow(client):
    from deus_api.auth.tokens import issue_reset_token

    payload = {"email": "flow@example.com", "password": "oldpassword"}
    signup = await client.post("/v1/auth/signup", json=payload)
    user_id = signup.json()["user"]["id"]

    token = issue_reset_token(user_id, "flow@example.com")
    confirm = await client.post(
        "/v1/auth/password-reset/confirm", json={"token": token, "password": "newpassword123"}
    )
    assert confirm.status_code == 200

    old_login = await client.post("/v1/auth/login", json=payload)
    assert old_login.status_code == 401

    new_login = await client.post(
        "/v1/auth/login", json={"email": "flow@example.com", "password": "newpassword123"}
    )
    assert new_login.status_code == 200


@pytest.mark.asyncio
async def test_password_reset_confirm_rejects_session_token(client):
    payload = {"email": "sessiontoken@example.com", "password": "correcthorse"}
    signup = await client.post("/v1/auth/signup", json=payload)
    session_token = signup.json()["token"]

    r = await client.post(
        "/v1/auth/password-reset/confirm",
        json={"token": session_token, "password": "irrelevant123"},
    )
    assert r.status_code == 400


@pytest.mark.asyncio
async def test_password_reset_token_does_not_authenticate_a_session(client):
    from deus_api.auth.tokens import issue_reset_token

    payload = {"email": "resetnotsession@example.com", "password": "correcthorse"}
    signup = await client.post("/v1/auth/signup", json=payload)
    user_id = signup.json()["user"]["id"]

    reset_token = issue_reset_token(user_id, "resetnotsession@example.com")
    r = await client.get("/v1/auth/me", headers={"Authorization": f"Bearer {reset_token}"})
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_password_reset_confirm_rejects_garbage_token(client):
    r = await client.post(
        "/v1/auth/password-reset/confirm",
        json={"token": "not-a-real-token", "password": "irrelevant123"},
    )
    assert r.status_code == 400

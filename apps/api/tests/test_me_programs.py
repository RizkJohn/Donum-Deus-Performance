import pytest

from conftest import make_request


@pytest.mark.asyncio
async def test_me_programs_requires_auth(client):
    r = await client.get("/v1/me/programs")
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_dashboard_sees_programs_generated_before_signup(client):
    """The dashboard joins on email — an account should see every program ever
    generated for its address, including ones from before the account existed."""
    email = "returning@example.com"

    # Program generated anonymously, before any account exists.
    pre = await client.post(
        "/v1/assess", json={"email": email, "payload": make_request().model_dump()}
    )
    assert pre.status_code == 200
    pre_id = pre.json()["id"]

    signup = await client.post(
        "/v1/auth/signup", json={"email": email, "password": "correcthorse"}
    )
    token = signup.json()["token"]

    # A second program, generated after the account exists.
    post = await client.post(
        "/v1/assess", json={"email": email, "payload": make_request().model_dump()}
    )
    post_id = post.json()["id"]

    r = await client.get("/v1/me/programs", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    body = r.json()
    assert body["email"] == email
    ids = [p["id"] for p in body["programs"]]
    assert pre_id in ids and post_id in ids
    # newest first
    assert ids.index(post_id) < ids.index(pre_id)
    assert body["state_summary"]["cycle_count"] == 2


@pytest.mark.asyncio
async def test_dashboard_empty_for_new_account(client):
    signup = await client.post(
        "/v1/auth/signup", json={"email": "fresh@example.com", "password": "correcthorse"}
    )
    token = signup.json()["token"]
    r = await client.get("/v1/me/programs", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["programs"] == []
    assert r.json()["state_summary"] is None

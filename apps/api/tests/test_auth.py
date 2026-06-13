import pytest
from httpx import ASGITransport, AsyncClient

from conftest import make_request
from deus_api.main import create_app


@pytest.fixture
async def client(tmp_path):
    from deus_api import config
    from deus_api.db import session as db_session

    config.get_settings.cache_clear()
    db_session._engine = None
    db_session._sessionmaker = None
    config.get_settings().database_url = f"sqlite+aiosqlite:///{tmp_path}/auth.db"

    app = create_app()
    await db_session.init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c

    config.get_settings.cache_clear()
    db_session._engine = None
    db_session._sessionmaker = None


CREDS = {"email": "lifter@example.com", "password": "barbell123"}


async def _register(client, creds=CREDS):
    return await client.post("/v1/auth/register", json=creds)


@pytest.mark.asyncio
async def test_register_returns_token_and_user(client):
    r = await _register(client)
    assert r.status_code == 200
    body = r.json()
    assert body["token"]
    assert body["user"]["email"] == CREDS["email"]
    assert body["user"]["id"]


@pytest.mark.asyncio
async def test_duplicate_email_rejected(client):
    await _register(client)
    r = await _register(client)
    assert r.status_code == 409


@pytest.mark.asyncio
async def test_short_password_rejected(client):
    r = await _register(client, {"email": "x@y.com", "password": "short"})
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_login_roundtrip(client):
    await _register(client)
    r = await client.post("/v1/auth/login", json=CREDS)
    assert r.status_code == 200
    assert r.json()["token"]


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    await _register(client)
    r = await client.post(
        "/v1/auth/login", json={"email": CREDS["email"], "password": "wrongpass1"}
    )
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_me_requires_auth(client):
    assert (await client.get("/v1/me/programs")).status_code == 401
    assert (await client.get("/v1/auth/me")).status_code == 401


@pytest.mark.asyncio
async def test_authenticated_generate_attaches_to_user(client):
    token = (await _register(client)).json()["token"]
    headers = {"authorization": f"Bearer {token}"}

    # anonymous generate is NOT in the user's history
    await client.post("/v1/generate", json=make_request().model_dump())
    # authenticated generate IS
    r = await client.post(
        "/v1/generate", json=make_request().model_dump(), headers=headers
    )
    assert r.status_code == 200

    listing = await client.get("/v1/me/programs", headers=headers)
    assert listing.status_code == 200
    programs = listing.json()
    assert len(programs) == 1
    assert "weekly_split" in programs[0]["program"]
    assert programs[0]["is_error"] is False


@pytest.mark.asyncio
async def test_invalid_token_treated_as_anonymous(client):
    r = await client.get("/v1/auth/me", headers={"authorization": "Bearer garbage"})
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_authed_assess_attaches_and_derives_email(client):
    token = (await _register(client)).json()["token"]
    headers = {"authorization": f"Bearer {token}"}
    # no email in body — derived from the authenticated user
    r = await client.post(
        "/v1/assess", json={"payload": make_request().model_dump()}, headers=headers
    )
    assert r.status_code == 200
    assert r.json()["id"]
    listing = await client.get("/v1/me/programs", headers=headers)
    assert len(listing.json()) == 1


@pytest.mark.asyncio
async def test_anonymous_assess_requires_email(client):
    r = await client.post("/v1/assess", json={"payload": make_request().model_dump()})
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_users_cannot_see_each_others_programs(client):
    t1 = (await _register(client, {"email": "a@x.com", "password": "pass-aaaa1"})).json()["token"]
    t2 = (await _register(client, {"email": "b@x.com", "password": "pass-bbbb1"})).json()["token"]
    await client.post(
        "/v1/generate", json=make_request().model_dump(),
        headers={"authorization": f"Bearer {t1}"},
    )
    other = await client.get("/v1/me/programs", headers={"authorization": f"Bearer {t2}"})
    assert other.json() == []

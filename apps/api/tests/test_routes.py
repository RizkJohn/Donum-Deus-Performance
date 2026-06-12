import pytest
from httpx import ASGITransport, AsyncClient

from conftest import make_request
from deus_api.main import create_app


@pytest.fixture
async def client(tmp_path, monkeypatch):
    monkeypatch.setenv("DATABASE_URL", f"sqlite+aiosqlite:///{tmp_path}/test.db")
    # reset cached settings/engine so the test DB URL takes effect
    from deus_api import config
    from deus_api.db import session as db_session
    config.get_settings.cache_clear()
    db_session._engine = None
    db_session._sessionmaker = None

    app = create_app()
    await db_session.init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c

    config.get_settings.cache_clear()
    db_session._engine = None
    db_session._sessionmaker = None


@pytest.mark.asyncio
async def test_healthz(client):
    r = await client.get("/healthz")
    assert r.status_code == 200


@pytest.mark.asyncio
async def test_generate_returns_program(client):
    r = await client.post("/v1/generate", json=make_request().model_dump())
    assert r.status_code == 200
    body = r.json()
    assert "weekly_split" in body and "sessions" in body


@pytest.mark.asyncio
async def test_generate_rejects_malformed_payload(client):
    r = await client.post("/v1/generate", json={"client_profile": {}})
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_assess_and_fetch_roundtrip(client):
    r = await client.post("/v1/assess", json={
        "email": "athlete@example.com",
        "payload": make_request().model_dump(),
    })
    assert r.status_code == 200
    body = r.json()
    assert body["id"] and "weekly_split" in body["program"]

    r2 = await client.get(f"/v1/programs/{body['id']}")
    assert r2.status_code == 200
    fetched = r2.json()
    assert fetched["email"] == "athlete@example.com"
    assert fetched["program"] == body["program"]


@pytest.mark.asyncio
async def test_fetch_unknown_program_404(client):
    r = await client.get("/v1/programs/nope")
    assert r.status_code == 404

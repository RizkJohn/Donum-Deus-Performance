import sys
from pathlib import Path

import pytest

API_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(API_ROOT))

from deus_api.config import get_settings  # noqa: E402
from deus_api.deps import get_lib, get_specs  # noqa: E402
from deus_api.models.input_contract import GenerateRequest  # noqa: E402


@pytest.fixture(scope="session")
def settings():
    return get_settings()


@pytest.fixture(scope="session")
def library():
    return get_lib()


@pytest.fixture(scope="session")
def specs():
    return get_specs()


def make_request(
    *,
    training_age="Intermediate",
    available_days=("Monday", "Tuesday", "Thursday", "Friday", "Saturday"),
    sport_days=None,
    sleep=2.0,
    soreness=2.0,
    energy=2.0,
    stress=2.0,
    injuries=(),
) -> GenerateRequest:
    return GenerateRequest.model_validate({
        "client_profile": {"age": 30, "weight": 180, "training_age": training_age},
        "goals": {"primary": "Strength", "secondary": ["Athletic Performance"]},
        "schedule": {
            "available_days": list(available_days),
            "sport_days": sport_days or {},
            "session_duration": 60,
        },
        "state": {
            "sleep": sleep,
            "soreness": soreness,
            "energy": energy,
            "stress": stress,
            "injuries": list(injuries),
        },
    })


@pytest.fixture
def base_request():
    return make_request()


async def subscribe(client, monkeypatch, email: str) -> None:
    """Sign up (or reuse an existing account) + simulate a completed Stripe
    checkout, so this email has an active subscription (see
    deus_api/billing/access.py — a second generated program requires one)."""
    from deus_api.billing import client as billing_client

    monkeypatch.setenv("STRIPE_WEBHOOK_SECRET", "whsec_x")
    get_settings.cache_clear()

    signup = await client.post("/v1/auth/signup", json={"email": email, "password": "correcthorse"})
    if signup.status_code == 409:
        login = await client.post("/v1/auth/login", json={"email": email, "password": "correcthorse"})
        me = await client.get(
            "/v1/auth/me", headers={"Authorization": f"Bearer {login.json()['token']}"}
        )
        user_id = me.json()["id"]
    else:
        user_id = signup.json()["user"]["id"]

    fake_event = {
        "type": "checkout.session.completed",
        "data": {"object": {"metadata": {"user_id": user_id, "tier": "foundation"}}},
    }
    monkeypatch.setattr(billing_client, "construct_webhook_event", lambda *a, **k: fake_event)
    r = await client.post(
        "/v1/billing/webhook", content=b"{}", headers={"stripe-signature": "t=1,v1=fake"}
    )
    assert r.status_code == 200


@pytest.fixture
async def client(tmp_path, monkeypatch):
    """Async HTTP client against a throwaway sqlite DB (shared by route tests)."""
    from httpx import ASGITransport, AsyncClient

    monkeypatch.setenv("DATABASE_URL", f"sqlite+aiosqlite:///{tmp_path}/test.db")
    from deus_api import config
    from deus_api.db import session as db_session
    from deus_api.billing.access import _FreeProgramIpTracker
    from deus_api.email.factory import reset_email_provider
    from deus_api.main import create_app
    from deus_api.middleware import RateLimitMiddleware

    config.get_settings.cache_clear()
    db_session._engine = None
    db_session._sessionmaker = None
    reset_email_provider()
    # Both stores below are ClassVars (shared across the whole pytest session
    # by design, for a real single-process deployment) -- reset per test or
    # unrelated tests bleed into each other's rate-limit/free-grant window.
    RateLimitMiddleware._store.clear()
    _FreeProgramIpTracker.reset()

    app = create_app()
    await db_session.init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c

    config.get_settings.cache_clear()
    db_session._engine = None
    db_session._sessionmaker = None
    reset_email_provider()
    RateLimitMiddleware._store.clear()
    _FreeProgramIpTracker.reset()

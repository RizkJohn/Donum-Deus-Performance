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


@pytest.fixture
async def client(tmp_path, monkeypatch):
    """Async HTTP client against a throwaway sqlite DB (shared by route tests)."""
    from httpx import ASGITransport, AsyncClient

    monkeypatch.setenv("DATABASE_URL", f"sqlite+aiosqlite:///{tmp_path}/test.db")
    from deus_api import config
    from deus_api.db import session as db_session
    from deus_api.email.factory import reset_email_provider
    from deus_api.main import create_app

    config.get_settings.cache_clear()
    db_session._engine = None
    db_session._sessionmaker = None
    reset_email_provider()

    app = create_app()
    await db_session.init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c

    config.get_settings.cache_clear()
    db_session._engine = None
    db_session._sessionmaker = None
    reset_email_provider()

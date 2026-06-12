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
    fatigue_score=2.5,
    fatigue_state="low",
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
            "fatigue_score": fatigue_score,
            "fatigue_state": fatigue_state,
            "injuries": list(injuries),
        },
    })


@pytest.fixture
def base_request():
    return make_request()

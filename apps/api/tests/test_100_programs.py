"""The roadmap's program contract test, expanded for the goal-driven engine:
over a large matrix of client profiles (training age x schedule x sport x
fatigue x primary goal, with rotating injuries), every pipeline output is
either a fully QC-valid program or a well-formed UNSATISFIABLE_CONSTRAINTS
error — never anything in between."""

import itertools

import pytest

from conftest import make_request
from deus_api.engine.pipeline import generate_program
from deus_api.llm.mock import MockProvider

TRAINING_AGES = ["Beginner", "Intermediate", "Advanced"]
DAY_SETS = [
    ["Monday"],
    ["Monday", "Thursday"],
    ["Monday", "Wednesday", "Friday"],
    ["Monday", "Tuesday", "Thursday", "Friday", "Saturday"],
    ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
]
SPORT_SETS = [None, {"basketball": ["Tuesday"]}, {"soccer": ["Monday", "Saturday"]}]
FATIGUE = [(1.5, "low"), (3.5, "moderate"), (4.5, "high")]
GOALS = ["Strength", "Hypertrophy", "Fat Loss", "Athletic Performance", "General Health"]
INJURY_ROTATION = [(), ("knee",), ("shoulder",), ("lower back",), ("knee", "shoulder")]

MATRIX = list(itertools.product(TRAINING_AGES, DAY_SETS, SPORT_SETS, FATIGUE, GOALS))


@pytest.mark.asyncio
@pytest.mark.parametrize("training_age,days,sports,fatigue,goal", MATRIX)
async def test_program_matrix(training_age, days, sports, fatigue, goal, specs, library):
    score, state = fatigue
    injuries = INJURY_ROTATION[(len(days) + len(goal)) % len(INJURY_ROTATION)]
    req = make_request(
        training_age=training_age, available_days=days, sport_days=sports,
        fatigue_score=score, fatigue_state=state, injuries=injuries,
        primary_goal=goal, session_duration=[30, 45, 60, 75, 90][len(days) % 5],
    )
    result = await generate_program(
        req, provider=MockProvider(), specs=specs, library=library
    )
    out = result.output
    if "error" in out:
        assert out["error"] == "UNSATISFIABLE_CONSTRAINTS"
        assert out["reasons"], "error must carry non-empty reasons"
    else:
        assert result.program is not None
        assert out["flags"], "progression flag must be present"
        assert out["sessions"], "program must contain sessions"


def test_matrix_size():
    assert len(MATRIX) >= 100

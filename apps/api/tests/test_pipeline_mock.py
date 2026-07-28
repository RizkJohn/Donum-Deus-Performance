import pytest

from conftest import make_request
from donum_dei_api.engine.pipeline import generate_program
from donum_dei_api.llm.mock import MockProvider


@pytest.mark.asyncio
async def test_pipeline_produces_valid_program(base_request, specs, library):
    result = await generate_program(
        base_request, provider=MockProvider(), specs=specs, library=library
    )
    assert result.error is None
    assert result.program is not None
    assert result.attempts == 1
    out = result.output
    assert set(out) == {"weekly_split", "sessions", "conditioning", "mobility", "flags"}


@pytest.mark.asyncio
async def test_pipeline_retries_then_succeeds(base_request, specs, library):
    result = await generate_program(
        base_request, provider=MockProvider(fail_first=True),
        specs=specs, library=library,
    )
    assert result.error is None
    assert result.attempts == 2
    assert result.qc_history  # first attempt's failures recorded


@pytest.mark.asyncio
async def test_pipeline_unsatisfiable_passthrough(specs, library):
    req = make_request(available_days=["Monday"], sport_days={"soccer": ["Monday"]})
    result = await generate_program(
        req, provider=MockProvider(), specs=specs, library=library
    )
    assert result.program is None
    assert result.output["error"] == "UNSATISFIABLE_CONSTRAINTS"

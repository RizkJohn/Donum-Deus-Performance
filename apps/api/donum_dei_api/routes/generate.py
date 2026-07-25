"""POST /v1/generate — client payload in, program JSON out.

Per the engine contract the response body is either the Program or
{"error":"UNSATISFIABLE_CONSTRAINTS","reasons":[...]} — JSON only, never a
partial plan. Malformed payloads are rejected with 422 by Pydantic.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import get_settings
from ..db.models import ProgramRun
from ..db.session import get_db
from ..deps import get_lib, get_provider, get_specs
from ..engine.pipeline import PipelineResult, generate_program
from ..models.athlete_state import AthleteState
from ..models.input_contract import GenerateRequest

router = APIRouter()


async def run_pipeline(
    req: GenerateRequest,
    db: AsyncSession,
    *,
    state: AthleteState | None = None,
    persist: bool = True,
) -> tuple[ProgramRun, PipelineResult]:
    """Run the full pipeline. Returns (row, result) so callers (assess) can fold
    the generated program back into athlete state.

    When ``persist`` is True the run is written to program_runs. Callers that do
    not associate the run with an identity (see /v1/generate) pass
    ``persist=False`` so no owner-less health payload is stored with no path to
    export or erasure.
    """
    provider = get_provider()
    settings = get_settings()
    result = await generate_program(
        req,
        provider=provider,
        specs=get_specs(),
        library=get_lib(),
        max_attempts=settings.max_attempts,
        state=state,
        generation_model=settings.generation_model,
    )
    run = ProgramRun(
        payload=req.model_dump(),
        program=result.output,
        assessment=result.assessment.model_dump() if result.assessment else None,
        provider=provider.name,
        attempts=result.attempts,
        qc_history=result.qc_history,
    )
    if persist:
        db.add(run)
        await db.commit()
    return run, result


@router.post("/v1/generate")
async def generate(req: GenerateRequest, db: AsyncSession = Depends(get_db)) -> dict:
    # Stateless: this endpoint returns the program only and never hands back an
    # id, so a persisted run would be an orphaned health record — unreachable by
    # the email-keyed export/erasure endpoints. Generate ephemerally; /v1/assess
    # is the path that persists (and links a Lead for data-subject requests).
    run, _ = await run_pipeline(req, db, persist=False)
    return run.program

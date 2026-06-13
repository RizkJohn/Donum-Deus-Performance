"""POST /v1/generate — client payload in, program JSON out.

Per the engine contract the response body is either the Program or
{"error":"UNSATISFIABLE_CONSTRAINTS","reasons":[...]} — JSON only, never a
partial plan. Malformed payloads are rejected with 422 by Pydantic.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import get_settings
from ..db.models import ProgramRun, User
from ..db.session import get_db
from ..deps import get_lib, get_optional_user, get_provider, get_specs
from ..engine.pipeline import generate_program
from ..models.input_contract import GenerateRequest

router = APIRouter()


async def run_pipeline(
    req: GenerateRequest, db: AsyncSession, user_id: str | None = None
) -> ProgramRun:
    provider = get_provider()
    result = await generate_program(
        req,
        provider=provider,
        specs=get_specs(),
        library=get_lib(),
        max_attempts=get_settings().max_attempts,
    )
    run = ProgramRun(
        user_id=user_id,
        payload=req.model_dump(),
        program=result.output,
        provider=provider.name,
        attempts=result.attempts,
        qc_history=result.qc_history,
    )
    db.add(run)
    await db.commit()
    return run


@router.post("/v1/generate")
async def generate(
    req: GenerateRequest,
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
) -> dict:
    run = await run_pipeline(req, db, user_id=user.id if user else None)
    return run.program

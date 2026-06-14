"""Assessment funnel endpoints.

POST /v1/assess        — lead capture + program generation in one call
GET  /v1/programs/{id} — fetch a stored run for the result page
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..auth.deps import get_current_user, get_current_user_optional
from ..db.models import Lead, ProgramRun, User
from ..db.session import get_db
from ..models.input_contract import GenerateRequest
from .generate import run_pipeline

router = APIRouter()


class AssessRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    email: EmailStr
    payload: GenerateRequest


@router.post("/v1/assess")
async def assess(
    req: AssessRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
) -> dict:
    run = await run_pipeline(req.payload, db)
    user_id = current_user.id if current_user else None
    run.user_id = user_id
    lead = Lead(email=str(req.email), run_id=run.id, user_id=user_id)
    db.add(lead)
    await db.commit()
    return {"id": run.id, "program": run.program}


@router.get("/v1/programs")
async def list_programs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list:
    rows = (
        await db.execute(
            select(ProgramRun)
            .where(ProgramRun.user_id == current_user.id)
            .order_by(ProgramRun.created_at.desc())
            .limit(20)
        )
    ).scalars().all()
    return [
        {
            "id": r.id,
            "created_at": r.created_at.isoformat(),
            "payload": r.payload,
            "program": r.program,
        }
        for r in rows
    ]


@router.get("/v1/programs/{run_id}")
async def get_program(run_id: str, db: AsyncSession = Depends(get_db)) -> dict:
    run = await db.get(ProgramRun, run_id)
    if run is None:
        raise HTTPException(status_code=404, detail="program not found")
    lead = (
        await db.execute(select(Lead).where(Lead.run_id == run_id))
    ).scalar_one_or_none()
    return {
        "id": run.id,
        "email": lead.email if lead else None,
        "payload": run.payload,
        "program": run.program,
        "created_at": run.created_at.isoformat(),
    }

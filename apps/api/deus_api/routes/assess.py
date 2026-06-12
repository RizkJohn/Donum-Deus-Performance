"""Assessment funnel endpoints.

POST /v1/assess        — lead capture + program generation in one call
GET  /v1/programs/{id} — fetch a stored run for the result page
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.models import Lead, ProgramRun
from ..db.session import get_db
from ..models.input_contract import GenerateRequest
from .generate import run_pipeline

router = APIRouter()


class AssessRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    email: EmailStr
    payload: GenerateRequest


@router.post("/v1/assess")
async def assess(req: AssessRequest, db: AsyncSession = Depends(get_db)) -> dict:
    run = await run_pipeline(req.payload, db)
    lead = Lead(email=str(req.email), run_id=run.id)
    db.add(lead)
    await db.commit()
    return {"id": run.id, "program": run.program}


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

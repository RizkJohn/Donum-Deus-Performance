"""Assessment funnel endpoints.

POST /v1/assess        — lead capture + program generation in one call
GET  /v1/programs/{id} — fetch a stored run for the result page
DELETE /v1/data        — GDPR/CCPA right to erasure: delete all records for an email
GET  /v1/data          — GDPR right of access: export all records for an email
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict, EmailStr, TypeAdapter
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

_email_adapter = TypeAdapter(EmailStr)

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


class DataDeleteRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    email: EmailStr


@router.delete("/v1/data")
async def delete_data(
    req: DataDeleteRequest, db: AsyncSession = Depends(get_db)
) -> dict:
    """GDPR right to erasure / CCPA right to delete.

    Permanently removes all leads and associated program runs for the
    given email address. Returns a count of deleted records.
    """
    leads = (
        await db.execute(select(Lead).where(Lead.email == str(req.email)))
    ).scalars().all()

    run_ids = [lead.run_id for lead in leads]

    for lead in leads:
        await db.delete(lead)

    if run_ids:
        runs = (
            await db.execute(
                select(ProgramRun).where(ProgramRun.id.in_(run_ids))
            )
        ).scalars().all()
        for run in runs:
            await db.delete(run)

    await db.commit()
    return {
        "deleted_programmes": len(run_ids),
        "message": "All personal data associated with this email has been permanently deleted.",
    }


@router.get("/v1/data")
async def export_data(
    email: str = Query(..., description="Email address as submitted in the assessment"),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """GDPR right of access / CCPA right to know.

    Returns all assessment inputs and programme records associated with the
    given email address in a structured, portable format.

    Note: This endpoint requires only an email address for access. A future
    improvement will add an email-verification step before disclosure.
    """
    try:
        validated = _email_adapter.validate_python(email)
    except Exception:
        raise HTTPException(status_code=422, detail="Invalid email address.")

    rows = (
        await db.execute(
            select(Lead, ProgramRun)
            .join(ProgramRun, Lead.run_id == ProgramRun.id)
            .where(Lead.email == str(validated))
        )
    ).all()

    records = [
        {
            "programme_id": run.id,
            "submitted_at": lead.created_at.isoformat(),
            "assessment_inputs": run.payload,
            "programme_generated": run.program is not None,
        }
        for lead, run in rows
    ]

    return {
        "email": str(validated),
        "record_count": len(records),
        "records": records,
    }

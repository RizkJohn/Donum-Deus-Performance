"""Assessment funnel endpoints.

POST /v1/assess        — lead capture + persistent-state assessment + program
GET  /v1/programs/{id} — fetch a stored run (program + coach's read + state)
DELETE /v1/data        — GDPR/CCPA right to erasure: delete all records for an email
GET  /v1/data          — GDPR right of access: export all records for an email
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel, ConfigDict, EmailStr, TypeAdapter
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

_email_adapter = TypeAdapter(EmailStr)

from ..billing.access import (
    free_program_ip_limit_exceeded,
    has_active_subscription,
    has_used_free_program,
    is_disposable_email,
    record_free_program_grant,
)
from ..db.models import AthleteStateRow, Feedback, Lead, ProgramRun
from ..db.session import get_db
from ..deps import get_lib
from ..email.factory import get_email_provider
from ..email.templates import program_ready_email
from ..engine.athlete_state import load_or_init, update_exposure
from ..models.athlete_state import AthleteState
from ..models.input_contract import GenerateRequest
from .generate import run_pipeline

router = APIRouter()


def _state_summary(state: AthleteState) -> dict:
    """Compact, athlete-facing slice of persistent state for the UI."""
    return {
        "cycle_count": state.cycle_count,
        "fatigue_index": state.fatigue_index,
        "compliance_score": state.compliance_score,
        "recovery_capacity": state.recovery_capacity,
        "novelty_tolerance": state.novelty_tolerance,
        "recent_movement_patterns": state.recent_movement_patterns,
    }


class AssessRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    email: EmailStr
    payload: GenerateRequest


@router.post("/v1/assess")
async def assess(req: AssessRequest, request: Request, db: AsyncSession = Depends(get_db)) -> dict:
    email = str(req.email)

    # Subscribers are exempt from every free-program abuse check below --
    # they've already paid, so an email-domain heuristic or an IP shared with
    # other free-tier signups must never lock out someone who's a customer.
    ip = request.client.host if request.client else "unknown"
    subscribed = await has_active_subscription(db, email)
    is_free_grant = False

    if not subscribed:
        if await has_used_free_program(db, email):
            raise HTTPException(
                status_code=402,
                detail="Your free program is complete. Subscribe to keep training — "
                "the engine adapts weekly based on your feedback.",
            )

        if is_disposable_email(email):
            raise HTTPException(
                status_code=422,
                detail="Please use a permanent email address — the engine needs "
                "to reach you as your program adapts, so disposable/temporary "
                "email addresses aren't supported.",
            )

        if free_program_ip_limit_exceeded(ip):
            raise HTTPException(
                status_code=402,
                detail="The free program limit for this network has been reached "
                "for today. Subscribe to continue, or try again tomorrow.",
            )
        is_free_grant = True

    # Load persistent athlete state (or initialise) and fold in this check-in.
    row = await db.get(AthleteStateRow, email)
    state = load_or_init(row.state if row else None, req.payload)

    run, result = await run_pipeline(req.payload, db, state=state)

    # Fold the prescribed work back into exposure (only on a real program).
    if result.program is not None:
        update_exposure(state, run.program, get_lib())
        if is_free_grant:
            record_free_program_grant(ip)

    if row is None:
        db.add(AthleteStateRow(email=email, state=state.model_dump()))
    else:
        row.state = state.model_dump()

    db.add(Lead(email=email, run_id=run.id))
    await db.commit()

    if result.program is not None:
        subject, html = program_ready_email(run.id)
        await get_email_provider().send(to=email, subject=subject, html=html)

    return {
        "id": run.id,
        "program": run.program,
        "assessment": run.assessment,
        "state_summary": _state_summary(state),
    }


@router.get("/v1/programs/{run_id}")
async def get_program(run_id: str, db: AsyncSession = Depends(get_db)) -> dict:
    run = await db.get(ProgramRun, run_id)
    if run is None:
        raise HTTPException(status_code=404, detail="program not found")
    lead = (
        await db.execute(select(Lead).where(Lead.run_id == run_id))
    ).scalar_one_or_none()

    state_summary = None
    if lead is not None:
        state_row = await db.get(AthleteStateRow, lead.email)
        if state_row is not None:
            state_summary = _state_summary(AthleteState.model_validate(state_row.state))

    return {
        "id": run.id,
        "email": lead.email if lead else None,
        "payload": run.payload,
        "program": run.program,
        "assessment": run.assessment,
        "state_summary": state_summary,
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

    Permanently removes all leads, program runs, reinforcement feedback, and
    persistent athlete state for the given email. Returns deletion counts.
    """
    email = str(req.email)
    leads = (
        await db.execute(select(Lead).where(Lead.email == email))
    ).scalars().all()

    run_ids = [lead.run_id for lead in leads]

    for lead in leads:
        await db.delete(lead)

    feedback = (
        await db.execute(select(Feedback).where(Feedback.email == email))
    ).scalars().all()
    for fb in feedback:
        await db.delete(fb)

    if run_ids:
        runs = (
            await db.execute(
                select(ProgramRun).where(ProgramRun.id.in_(run_ids))
            )
        ).scalars().all()
        for run in runs:
            await db.delete(run)

    state_row = await db.get(AthleteStateRow, email)
    if state_row is not None:
        await db.delete(state_row)

    await db.commit()
    return {
        "deleted_programs": len(run_ids),
        "deleted_feedback": len(feedback),
        "deleted_athlete_state": 1 if state_row is not None else 0,
        "message": "All personal data associated with this email has been permanently deleted.",
    }


@router.get("/v1/data")
async def export_data(
    email: str = Query(..., description="Email address as submitted in the assessment"),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """GDPR right of access / CCPA right to know.

    Returns all assessment inputs and program records associated with the
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
            "program_id": run.id,
            "submitted_at": lead.created_at.isoformat(),
            "assessment_inputs": run.payload,
            "program_generated": run.program is not None,
        }
        for lead, run in rows
    ]

    state_row = await db.get(AthleteStateRow, str(validated))

    return {
        "email": str(validated),
        "record_count": len(records),
        "records": records,
        "athlete_state": state_row.state if state_row else None,
    }

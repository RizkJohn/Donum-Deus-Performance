"""Assessment funnel endpoints.

POST /v1/assess        — lead capture + persistent-state assessment + program
GET  /v1/programs/{id} — fetch a stored run (program + coach's read + state)
POST /v1/data/request  — email a confirmation token for export or erasure
GET  /v1/data          — GDPR right of access: export, token-gated
DELETE /v1/data        — GDPR/CCPA right to erasure: delete all, token-gated

The data endpoints require a purpose-scoped token from /v1/data/request,
delivered only to the email address itself — possession proves ownership.
"""

from typing import Literal

import jwt
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..auth.tokens import decode_data_token, issue_data_token
from ..billing import client as billing_client
from ..billing.gate import require_active_subscription
from ..config import get_settings
from ..db.models import AthleteStateRow, Feedback, Lead, ProgramRun, User
from ..db.session import get_db
from ..deps import get_lib
from ..email.factory import get_email_provider
from ..email.templates import data_request_email, program_ready_email
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
async def assess(req: AssessRequest, db: AsyncSession = Depends(get_db)) -> dict:
    email = str(req.email)

    # First program is free; a repeat assessment is ongoing adaptation and
    # requires an active subscription (billing/gate.py — no-op w/o Stripe).
    prior = (
        await db.execute(select(Lead).where(Lead.email == email).limit(1))
    ).scalar_one_or_none()
    if prior is not None:
        await require_active_subscription(db, email)

    # Load persistent athlete state (or initialise) and fold in this check-in.
    row = await db.get(AthleteStateRow, email)
    state = load_or_init(row.state if row else None, req.payload)

    run, result = await run_pipeline(req.payload, db, state=state)

    # Fold the prescribed work back into exposure (only on a real program).
    if result.program is not None:
        update_exposure(state, run.program, get_lib())

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


class DataAccessRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    email: EmailStr
    action: Literal["export", "erase"]


@router.post("/v1/data/request")
async def request_data_access(req: DataAccessRequest) -> dict:
    """Step 1 of export/erasure: email a purpose-scoped confirmation token to
    the address. Response is identical whether or not the address has data —
    the endpoint must not confirm what we hold to someone who only knows an
    email. Rate-limited (middleware) since it triggers outbound email."""
    email = str(req.email)
    token = issue_data_token(email, req.action)
    subject, html = data_request_email(req.action, token)
    await get_email_provider().send(to=email, subject=subject, html=html)
    ttl = get_settings().data_token_ttl_minutes
    return {
        "message": (
            "If this address has data with us, a confirmation code has been "
            f"emailed to it. The code expires in {ttl} minutes."
        )
    }


class DataDeleteRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    token: str


_BAD_TOKEN = HTTPException(
    status_code=401,
    detail="Invalid or expired confirmation code. Request a new one via POST /v1/data/request.",
)


@router.delete("/v1/data")
async def delete_data(
    req: DataDeleteRequest, db: AsyncSession = Depends(get_db)
) -> dict:
    """GDPR right to erasure / CCPA right to delete.

    Requires an `erase` token from /v1/data/request. Permanently removes all
    leads, program runs, reinforcement feedback, persistent athlete state,
    and any account for the token's email. An active Stripe subscription is
    cancelled first — if that fails, nothing is deleted (rolled back) so an
    erased client is never left silently paying."""
    try:
        email = decode_data_token(req.token, "erase")
    except jwt.PyJWTError:
        raise _BAD_TOKEN

    settings = get_settings()
    user = (
        await db.execute(select(User).where(User.email == email))
    ).scalar_one_or_none()
    if user is not None:
        if user.stripe_subscription_id and settings.stripe_secret_key:
            try:
                billing_client.cancel_subscription(
                    settings, subscription_id=user.stripe_subscription_id
                )
            except Exception:
                raise HTTPException(
                    status_code=502,
                    detail=(
                        "Could not cancel the active subscription; no data was "
                        "deleted. Try again shortly or contact support."
                    ),
                )
        await db.delete(user)

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
        "deleted_account": 1 if user is not None else 0,
        "message": "All personal data associated with this email has been permanently deleted.",
    }


@router.get("/v1/data")
async def export_data(
    token: str = Query(..., description="Export confirmation code from POST /v1/data/request"),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """GDPR right of access / CCPA right to know.

    Requires an `export` token from /v1/data/request. Returns all assessment
    inputs and program records for the token's email in a portable format."""
    try:
        email = decode_data_token(token, "export")
    except jwt.PyJWTError:
        raise _BAD_TOKEN

    rows = (
        await db.execute(
            select(Lead, ProgramRun)
            .join(ProgramRun, Lead.run_id == ProgramRun.id)
            .where(Lead.email == email)
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

    state_row = await db.get(AthleteStateRow, email)

    return {
        "email": email,
        "record_count": len(records),
        "records": records,
        "athlete_state": state_row.state if state_row else None,
    }

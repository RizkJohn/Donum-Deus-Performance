"""Assessment funnel endpoints.

POST /v1/assess        — lead capture + program generation in one call
GET  /v1/programs/{id} — fetch a stored run for the result page
"""

import httpx
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import get_settings
from ..db.models import Lead, ProgramRun
from ..db.session import get_db
from ..models.input_contract import GenerateRequest
from .generate import run_pipeline

router = APIRouter()


class AssessRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    email: EmailStr
    payload: GenerateRequest


async def _notify_n8n(webhook_base: str, body: dict) -> None:
    """Fire-and-forget POST to n8n program-ready webhook. Non-critical."""
    url = f"{webhook_base.rstrip('/')}/webhook/program-ready"
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            await client.post(url, json=body)
    except Exception:
        pass


@router.post("/v1/assess")
async def assess(
    req: AssessRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
) -> dict:
    run = await run_pipeline(req.payload, db)
    lead = Lead(email=str(req.email), run_id=run.id)
    db.add(lead)
    await db.commit()

    settings = get_settings()
    if settings.n8n_webhook_url:
        background_tasks.add_task(
            _notify_n8n,
            webhook_base=settings.n8n_webhook_url,
            body={
                "run_id": run.id,
                "email": str(req.email),
                "program": run.program,
                "payload": req.payload.model_dump(),
            },
        )

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

"""Authenticated client dashboard data: the signed-in user's program history."""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.models import ProgramRun, User
from ..db.session import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/v1/me", tags=["me"])


@router.get("/programs")
async def list_my_programs(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> list[dict]:
    rows = (
        await db.execute(
            select(ProgramRun)
            .where(ProgramRun.user_id == user.id)
            .order_by(ProgramRun.created_at.desc())
        )
    ).scalars().all()
    return [
        {
            "id": r.id,
            "payload": r.payload,
            "program": r.program,
            "is_error": "error" in r.program,
            "created_at": r.created_at.isoformat(),
        }
        for r in rows
    ]

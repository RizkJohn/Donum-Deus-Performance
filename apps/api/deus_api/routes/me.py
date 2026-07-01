"""GET /v1/me/programs — the dashboard's data source.

Joins on email rather than a foreign key (see db/models.py User docstring):
an account can see every program ever generated for its email address,
including ones generated before the account existed.
"""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..auth.deps import get_current_user
from ..db.models import AthleteStateRow, Lead, ProgramRun, User
from ..db.session import get_db
from ..models.athlete_state import AthleteState

router = APIRouter()


def _state_summary(state: AthleteState) -> dict:
    return {
        "cycle_count": state.cycle_count,
        "fatigue_index": state.fatigue_index,
        "compliance_score": state.compliance_score,
        "recovery_capacity": state.recovery_capacity,
        "novelty_tolerance": state.novelty_tolerance,
        "recent_movement_patterns": state.recent_movement_patterns,
    }


@router.get("/v1/me/programs")
async def my_programs(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> dict:
    rows = (
        await db.execute(
            select(Lead, ProgramRun)
            .join(ProgramRun, Lead.run_id == ProgramRun.id)
            .where(Lead.email == user.email)
            .order_by(ProgramRun.created_at.desc())
        )
    ).all()

    state_row = await db.get(AthleteStateRow, user.email)
    state_summary = (
        _state_summary(AthleteState.model_validate(state_row.state))
        if state_row is not None
        else None
    )

    return {
        "email": user.email,
        "state_summary": state_summary,
        "programs": [
            {
                "id": run.id,
                "payload": run.payload,
                "program": run.program,
                "assessment": run.assessment,
                "created_at": run.created_at.isoformat(),
            }
            for _lead, run in rows
        ],
    }

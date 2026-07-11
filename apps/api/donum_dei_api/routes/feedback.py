"""POST /v1/feedback — reinforcement signals (docs/RedesignGuide.md §6).

Stored as an audit record and folded into the athlete's persistent state so the
next assessment autoregulates on real adherence/effort, not intake alone.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.models import AthleteStateRow, Feedback, ProgramRun
from ..db.session import get_db
from ..engine.athlete_state import fold_feedback
from ..models.athlete_state import AthleteState
from ..models.feedback import FeedbackIn

router = APIRouter()


@router.post("/v1/feedback")
async def submit_feedback(fb: FeedbackIn, db: AsyncSession = Depends(get_db)) -> dict:
    run = await db.get(ProgramRun, fb.run_id)
    if run is None:
        raise HTTPException(status_code=404, detail="program run not found")

    email = str(fb.email)
    db.add(Feedback(email=email, run_id=fb.run_id, signals=fb.model_dump(mode="json")))

    summary = None
    row = await db.get(AthleteStateRow, email)
    if row is not None:
        state = AthleteState.model_validate(row.state)
        fold_feedback(state, fb)
        row.state = state.model_dump()
        summary = {
            "compliance_score": state.compliance_score,
            "fatigue_index": state.fatigue_index,
        }

    await db.commit()
    return {"ok": True, "state_summary": summary}

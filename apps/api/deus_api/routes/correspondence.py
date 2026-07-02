"""POST /v1/correspondence — the public /correspondence contact form. No
auth, no persistence: it forwards straight to the founder's inbox with
reply-to set to the submitter, which is the whole product for a
single-operator business (no admin dashboard needed to read it)."""

from fastapi import APIRouter

from ..config import get_settings
from ..email.factory import get_email_provider
from ..email.templates import correspondence_email
from ..models.correspondence import CorrespondenceIn

router = APIRouter()


@router.post("/v1/correspondence", status_code=202)
async def submit_correspondence(req: CorrespondenceIn) -> dict:
    provider = get_email_provider()
    subject, html = correspondence_email(
        req.given_name, req.family_name, str(req.email), req.inquiry_type, req.message
    )
    await provider.send(
        to=get_settings().contact_email, subject=subject, html=html, reply_to=str(req.email)
    )
    return {"detail": "Received. A reply will follow within one business day."}

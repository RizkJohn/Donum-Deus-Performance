"""Auth routes: magic-link sign-in + session management.

POST /v1/auth/magic-link  — send a sign-in email
GET  /v1/auth/verify      — validate token, upsert user, return session JWT
GET  /v1/auth/me          — return current user from Bearer token
POST /v1/auth/sign-out    — (client-side: just discard the token; included for completeness)
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..auth.deps import get_current_user
from ..auth.tokens import (
    create_magic_token,
    create_session_token,
    verify_magic_token,
)
from ..config import Settings, get_settings
from ..db.models import User
from ..db.session import get_db
from ..deps import get_email_provider
from ..email.base import EmailProvider

router = APIRouter(prefix="/v1/auth")


class MagicLinkRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    email: EmailStr


@router.post("/magic-link", status_code=202)
async def send_magic_link(
    body: MagicLinkRequest,
    settings: Settings = Depends(get_settings),
    email_provider: EmailProvider = Depends(get_email_provider),
) -> dict:
    token = create_magic_token(str(body.email), settings.secret_key)
    link = f"{settings.web_url}/auth/verify?token={token}"
    await email_provider.send_magic_link(to=str(body.email), link=link)
    return {"status": "sent"}


@router.get("/verify")
async def verify_magic_link(
    token: str,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> dict:
    try:
        email = verify_magic_token(token, settings.secret_key)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or expired link")

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user is None:
        user = User(email=email)
        db.add(user)
        await db.commit()
        await db.refresh(user)

    session_token = create_session_token(user.id, settings.secret_key)
    return {
        "access_token": session_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "subscription_tier": user.subscription_tier,
        },
    }


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)) -> dict:
    return {
        "id": current_user.id,
        "email": current_user.email,
        "subscription_tier": current_user.subscription_tier,
    }

"""Accounts. Stateless JWT sessions (see auth/tokens.py) — the web app's
Next.js Route Handlers are the actual session boundary (httpOnly cookie on
the browser-facing origin); this API only ever sees a Bearer token.
"""

import jwt
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..auth.deps import get_current_user
from ..auth.hashing import hash_password, verify_password
from ..auth.tokens import decode_data_token, issue_data_token, issue_token
from ..db.models import User
from ..db.session import get_db
from ..email.factory import get_email_provider
from ..email.templates import password_reset_email, welcome_email
from ..models.user import AuthResponse, LoginRequest, SignupRequest, UserOut

router = APIRouter()


def _user_out(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        email=user.email,
        subscription_tier=user.subscription_tier,
        subscription_status=user.subscription_status,
    )


@router.post("/v1/auth/signup", status_code=201)
async def signup(req: SignupRequest, db: AsyncSession = Depends(get_db)) -> AuthResponse:
    email = str(req.email)
    existing = (
        await db.execute(select(User).where(User.email == email))
    ).scalar_one_or_none()
    if existing is not None:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    user = User(email=email, hashed_password=hash_password(req.password))
    db.add(user)
    await db.commit()
    await db.refresh(user)

    provider = get_email_provider()
    subject, html = welcome_email()
    await provider.send(to=email, subject=subject, html=html)

    return AuthResponse(token=issue_token(user.id, user.email), user=_user_out(user))


@router.post("/v1/auth/login")
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)) -> AuthResponse:
    email = str(req.email)
    user = (
        await db.execute(select(User).where(User.email == email))
    ).scalar_one_or_none()
    if user is None or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")
    return AuthResponse(token=issue_token(user.id, user.email), user=_user_out(user))


@router.get("/v1/auth/me")
async def me(user: User = Depends(get_current_user)) -> UserOut:
    return _user_out(user)


class ResetRequestIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    email: EmailStr


class ResetIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    token: str
    new_password: str = Field(min_length=8, max_length=200)


@router.post("/v1/auth/reset-request")
async def reset_request(req: ResetRequestIn, db: AsyncSession = Depends(get_db)) -> dict:
    """Email a password-reset code. Uniform response whether or not an
    account exists (no enumeration); the email only goes out when one does.
    Rate-limited (middleware) since it triggers outbound email."""
    email = str(req.email)
    user = (
        await db.execute(select(User).where(User.email == email))
    ).scalar_one_or_none()
    if user is not None:
        token = issue_data_token(email, "password-reset")
        subject, html = password_reset_email(token)
        await get_email_provider().send(to=email, subject=subject, html=html)
    return {
        "message": (
            "If an account exists for this address, a reset code has been "
            "emailed to it."
        )
    }


@router.post("/v1/auth/reset")
async def reset_password(req: ResetIn, db: AsyncSession = Depends(get_db)) -> dict:
    """Set a new password using the emailed code. The code is purpose-scoped
    (a data-export/erase token can't reset a password, nor vice versa) and
    expires with DATA_TOKEN_TTL_MINUTES."""
    try:
        email = decode_data_token(req.token, "password-reset")
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired reset code. Request a new one.",
        )
    user = (
        await db.execute(select(User).where(User.email == email))
    ).scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid or expired reset code. Request a new one.")
    user.hashed_password = hash_password(req.new_password)
    await db.commit()
    return {"message": "Password updated. You can now log in with the new password."}

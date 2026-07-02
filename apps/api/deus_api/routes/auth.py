"""Accounts. Stateless JWT sessions (see auth/tokens.py) — the web app's
Next.js Route Handlers are the actual session boundary (httpOnly cookie on
the browser-facing origin); this API only ever sees a Bearer token.
"""

import jwt
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..auth.deps import get_current_user
from ..auth.hashing import hash_password, verify_password
from ..auth.tokens import RESET_SCOPE, decode_token, issue_reset_token, issue_token
from ..db.models import User
from ..db.session import get_db
from ..email.factory import get_email_provider
from ..email.templates import password_reset_email, welcome_email
from ..models.user import (
    AuthResponse,
    LoginRequest,
    PasswordResetConfirm,
    PasswordResetRequest,
    SignupRequest,
    UserOut,
)

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


@router.post("/v1/auth/password-reset/request", status_code=202)
async def request_password_reset(
    req: PasswordResetRequest, db: AsyncSession = Depends(get_db)
) -> dict:
    """Always returns 202 regardless of whether the email exists, so this
    can't be used to enumerate registered accounts."""
    email = str(req.email)
    user = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
    if user is not None:
        provider = get_email_provider()
        subject, html = password_reset_email(issue_reset_token(user.id, user.email))
        await provider.send(to=email, subject=subject, html=html)
    return {"detail": "If that email has an account, a reset link has been sent."}


@router.post("/v1/auth/password-reset/confirm")
async def confirm_password_reset(
    req: PasswordResetConfirm, db: AsyncSession = Depends(get_db)
) -> dict:
    try:
        claims = decode_token(req.token)
    except jwt.PyJWTError:
        raise HTTPException(status_code=400, detail="This reset link is invalid or has expired.")
    if claims.get("scope") != RESET_SCOPE:
        raise HTTPException(status_code=400, detail="This reset link is invalid or has expired.")

    user = await db.get(User, claims.get("sub"))
    if user is None:
        raise HTTPException(status_code=400, detail="This reset link is invalid or has expired.")

    user.hashed_password = hash_password(req.password)
    await db.commit()
    return {"detail": "Password updated. You can now log in."}

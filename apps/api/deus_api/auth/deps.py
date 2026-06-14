"""FastAPI dependency: resolve authenticated user from Bearer token."""

from fastapi import Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import Settings, get_settings
from ..db.models import User
from ..db.session import get_db
from .tokens import verify_session_token


async def get_current_user(
    authorization: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.removeprefix("Bearer ")
    try:
        user_id = verify_session_token(token, settings.secret_key)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def get_current_user_optional(
    authorization: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> User | None:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        return await get_current_user(authorization, db, settings)
    except HTTPException:
        return None

"""`get_current_user` — the one dependency every protected route imports."""

import jwt
from fastapi import Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.models import User
from ..db.session import get_db
from .tokens import decode_token

_UNAUTHORIZED = HTTPException(status_code=401, detail="Not authenticated")


async def get_current_user(
    authorization: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise _UNAUTHORIZED
    token = authorization.split(" ", 1)[1].strip()
    try:
        claims = decode_token(token)
    except jwt.PyJWTError:
        raise _UNAUTHORIZED
    # Purpose-scoped data tokens (auth/tokens.issue_data_token) share the
    # signing secret but are never sessions: no `sub`, always a `purpose`.
    sub = claims.get("sub")
    if not sub or "purpose" in claims:
        raise _UNAUTHORIZED
    user = await db.get(User, sub)
    if user is None:
        raise _UNAUTHORIZED
    return user

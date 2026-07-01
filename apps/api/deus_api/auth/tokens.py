"""Stateless session tokens (HS256 JWT). No server-side session store —
`AUTH_JWT_SECRET` is the entire trust boundary, so it must be overridden in
any real deployment (see config.py / .env.example)."""

from datetime import datetime, timedelta, timezone

import jwt

from ..config import get_settings

ALGORITHM = "HS256"


def issue_token(user_id: str, email: str) -> str:
    settings = get_settings()
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "email": email,
        "iat": now,
        "exp": now + timedelta(days=settings.auth_token_ttl_days),
    }
    return jwt.encode(payload, settings.auth_jwt_secret, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    """Raises jwt.PyJWTError on any invalid/expired/malformed token."""
    settings = get_settings()
    return jwt.decode(token, settings.auth_jwt_secret, algorithms=[ALGORITHM])

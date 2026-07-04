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


def issue_data_token(email: str, action: str) -> str:
    """Short-lived single-purpose token for the GDPR data endpoints, emailed
    to the address it grants access to — possession proves ownership. Carries
    `purpose` and no `sub`, so get_current_user rejects it as a session."""
    settings = get_settings()
    now = datetime.now(timezone.utc)
    payload = {
        "email": email,
        "purpose": f"data-{action}",
        "iat": now,
        "exp": now + timedelta(minutes=settings.data_token_ttl_minutes),
    }
    return jwt.encode(payload, settings.auth_jwt_secret, algorithm=ALGORITHM)


def decode_data_token(token: str, action: str) -> str:
    """Returns the verified email. Raises jwt.PyJWTError on invalid/expired
    tokens or purpose mismatch (an export token can never erase)."""
    claims = decode_token(token)
    if claims.get("purpose") != f"data-{action}" or "email" not in claims:
        raise jwt.InvalidTokenError("token purpose mismatch")
    return claims["email"]

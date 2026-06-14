"""Signed token utilities using itsdangerous (pure Python, no Rust deps).

Magic tokens: URLSafeTimedSerializer — signed, expiring, URL-safe.
Session tokens: same serializer with a different salt so the two types
are cryptographically isolated and cannot be swapped.
"""

from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

_MAGIC_TTL = 3600       # 1 hour
_SESSION_TTL = 86400 * 30  # 30 days


def _serializer(secret: str, salt: str) -> URLSafeTimedSerializer:
    return URLSafeTimedSerializer(secret, salt=salt)


def create_magic_token(email: str, secret: str) -> str:
    return _serializer(secret, "magic").dumps(email)


def verify_magic_token(token: str, secret: str) -> str:
    """Return email or raise ValueError on bad/expired token."""
    try:
        return _serializer(secret, "magic").loads(token, max_age=_MAGIC_TTL)
    except SignatureExpired as e:
        raise ValueError("magic link expired") from e
    except BadSignature as e:
        raise ValueError("invalid magic link") from e


def create_session_token(user_id: str, secret: str) -> str:
    return _serializer(secret, "session").dumps(user_id)


def verify_session_token(token: str, secret: str) -> str:
    """Return user_id or raise ValueError on bad/expired token."""
    try:
        return _serializer(secret, "session").loads(token, max_age=_SESSION_TTL)
    except SignatureExpired as e:
        raise ValueError("session expired") from e
    except BadSignature as e:
        raise ValueError("invalid session token") from e

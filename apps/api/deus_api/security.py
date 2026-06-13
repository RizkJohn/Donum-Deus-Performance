"""Password hashing (stdlib scrypt) and a minimal HS256 JWT (stdlib hmac).

No external crypto dependency — everything here is Python stdlib, so the API
installs and runs fully offline. HS256 is symmetric (HMAC-SHA256), which is
all we need for first-party tokens; if asymmetric/RS256 is ever required,
swap this module for PyJWT behind the same function signatures.
"""

import base64
import hashlib
import hmac
import json
import os
import time

from .config import get_settings

_N, _R, _P = 2**14, 8, 1


# --- password hashing -------------------------------------------------------

def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, n=_N, r=_R, p=_P)
    return f"scrypt${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        scheme, salt_hex, digest_hex = stored.split("$")
    except ValueError:
        return False
    if scheme != "scrypt":
        return False
    digest = hashlib.scrypt(
        password.encode(), salt=bytes.fromhex(salt_hex), n=_N, r=_R, p=_P
    )
    return hmac.compare_digest(digest.hex(), digest_hex)


# --- HS256 JWT --------------------------------------------------------------

def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _b64url_decode(segment: str) -> bytes:
    padding = "=" * (-len(segment) % 4)
    return base64.urlsafe_b64decode(segment + padding)


def _sign(signing_input: bytes, secret: str) -> str:
    sig = hmac.new(secret.encode(), signing_input, hashlib.sha256).digest()
    return _b64url(sig)


def create_access_token(user_id: str) -> str:
    s = get_settings()
    now = int(time.time())
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {"sub": user_id, "iat": now, "exp": now + s.jwt_expire_minutes * 60}
    header_b64 = _b64url(json.dumps(header, separators=(",", ":")).encode())
    payload_b64 = _b64url(json.dumps(payload, separators=(",", ":")).encode())
    signing_input = f"{header_b64}.{payload_b64}".encode()
    return f"{header_b64}.{payload_b64}.{_sign(signing_input, s.jwt_secret)}"


def decode_access_token(token: str) -> str | None:
    """Return the user id (sub) or None if malformed / bad signature / expired."""
    s = get_settings()
    try:
        header_b64, payload_b64, sig = token.split(".")
    except ValueError:
        return None
    expected = _sign(f"{header_b64}.{payload_b64}".encode(), s.jwt_secret)
    if not hmac.compare_digest(expected, sig):
        return None
    try:
        payload = json.loads(_b64url_decode(payload_b64))
    except (ValueError, json.JSONDecodeError):
        return None
    if not isinstance(payload, dict):
        return None
    if int(payload.get("exp", 0)) < int(time.time()):
        return None
    sub = payload.get("sub")
    return sub if isinstance(sub, str) else None

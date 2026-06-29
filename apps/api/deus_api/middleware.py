"""Security middleware stack.

Layer order (outermost → innermost as registered in main.py):
  SecurityHeadersMiddleware  — adds security headers to every response
  RequestSizeLimitMiddleware — rejects oversized request bodies early
  APIKeyMiddleware           — enforces X-API-Key on all non-health paths
  RateLimitMiddleware        — per-IP token-bucket limits, tiered by endpoint

Rate-limit tiers:
  strict    /v1/assess, /v1/generate  — 20 req/IP/hour (LLM + lead-capture)
  sensitive /v1/data                  — 10 req/IP/hour (personal-data access)
  standard  all other /v1/ paths      — 120 req/IP/hour

API key auth:
  When API_KEY is set (non-empty), every request to a non-exempted path must
  carry the header `X-API-Key: <value>`. Unauthenticated requests receive 401.
  Exempt paths: /healthz (liveness probe must not require credentials).

For multi-instance deployments replace the in-memory rate-limit store with a
Redis-backed solution (e.g. slowapi + Redis).
"""

import time
from collections import defaultdict
from typing import ClassVar

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

# ---------------------------------------------------------------------------
# Security headers
# ---------------------------------------------------------------------------

_SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Cache-Control": "no-store",
    "X-Permitted-Cross-Domain-Policies": "none",
}


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        for key, value in _SECURITY_HEADERS.items():
            response.headers.setdefault(key, value)
        return response


# ---------------------------------------------------------------------------
# Request body size limit
# ---------------------------------------------------------------------------


class RequestSizeLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_bytes: int = 65_536):
        super().__init__(app)
        self._max_bytes = max_bytes

    async def dispatch(self, request: Request, call_next) -> Response:
        cl = request.headers.get("content-length")
        if cl is not None and int(cl) > self._max_bytes:
            return Response(
                content='{"detail":"Request payload too large."}',
                status_code=413,
                media_type="application/json",
            )
        return await call_next(request)


# ---------------------------------------------------------------------------
# API key authentication
# ---------------------------------------------------------------------------

# Paths that must remain accessible without a key (liveness probes, CORS pre-flight).
_KEY_EXEMPT_PATHS = {"/healthz"}


class APIKeyMiddleware(BaseHTTPMiddleware):
    """Require X-API-Key header when api_key is configured.

    If api_key is empty the middleware is a no-op so local dev works without
    any configuration. Set API_KEY in production to lock down the API.
    """

    def __init__(self, app, api_key: str):
        super().__init__(app)
        self._api_key = api_key

    async def dispatch(self, request: Request, call_next) -> Response:
        if not self._api_key or request.url.path in _KEY_EXEMPT_PATHS:
            return await call_next(request)
        provided = request.headers.get("X-API-Key", "")
        if provided != self._api_key:
            return Response(
                content='{"detail":"Invalid or missing API key."}',
                status_code=401,
                media_type="application/json",
                headers={"WWW-Authenticate": 'ApiKey realm="Deus Performance API"'},
            )
        return await call_next(request)


# ---------------------------------------------------------------------------
# Rate limiting (in-memory, per-IP, sliding window)
# ---------------------------------------------------------------------------

# (limit, window_seconds) by tier
_TIER_CONFIG: dict[str, tuple[int, int]] = {
    "strict": (20, 3600),    # LLM + lead-capture: 20/IP/hr
    "sensitive": (10, 3600), # Personal-data endpoints: 10/IP/hr
    "standard": (120, 3600), # All other /v1/ paths: 120/IP/hr
}

_STRICT_PATHS = {"/v1/assess", "/v1/generate"}
_SENSITIVE_PREFIXES = ("/v1/data",)


def _rate_tier(path: str) -> str | None:
    if path in _STRICT_PATHS:
        return "strict"
    if path.startswith(_SENSITIVE_PREFIXES):
        return "sensitive"
    if path.startswith("/v1/"):
        return "standard"
    return None


class RateLimitMiddleware(BaseHTTPMiddleware):
    # keyed by (tier, ip)
    _store: ClassVar[dict[tuple[str, str], list[float]]] = defaultdict(list)

    async def dispatch(self, request: Request, call_next) -> Response:
        tier = _rate_tier(request.url.path)
        if tier is None:
            return await call_next(request)

        limit, window = _TIER_CONFIG[tier]
        ip = request.client.host if request.client else "unknown"
        now = time.monotonic()
        cutoff = now - window

        key = (tier, ip)
        bucket = [t for t in self._store[key] if t > cutoff]
        if len(bucket) >= limit:
            return Response(
                content='{"detail":"Rate limit exceeded. Please wait before retrying."}',
                status_code=429,
                media_type="application/json",
                headers={"Retry-After": str(window)},
            )

        bucket.append(now)
        self._store[key] = bucket
        return await call_next(request)

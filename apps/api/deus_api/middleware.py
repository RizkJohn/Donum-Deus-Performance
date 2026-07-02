"""Request rate-limiting middleware.

Applies per-IP limits to endpoints that trigger LLM calls or write personal
data. Implemented in-memory (per-process) — suitable for single-instance
deployments. For multi-instance production deployments, replace with a
Redis-backed solution (e.g. slowapi + Redis).
"""

import time
from collections import defaultdict
from typing import ClassVar

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

# Endpoints subject to strict rate limiting (LLM calls, lead capture, and
# anything that emails a third party on an unauthenticated request)
_RATE_LIMITED_PATHS = {
    "/v1/assess",
    "/v1/generate",
    "/v1/correspondence",
    "/v1/auth/password-reset/request",
}

# Requests per IP per window
_RATE_LIMIT = 20
_WINDOW_SECONDS = 3600  # 1 hour


class RateLimitMiddleware(BaseHTTPMiddleware):
    _store: ClassVar[dict[str, list[float]]] = defaultdict(list)

    async def dispatch(self, request: Request, call_next: object) -> Response:
        if request.url.path not in _RATE_LIMITED_PATHS:
            return await call_next(request)  # type: ignore[misc]

        ip = request.client.host if request.client else "unknown"
        now = time.monotonic()
        cutoff = now - _WINDOW_SECONDS

        window = [t for t in self._store[ip] if t > cutoff]
        if len(window) >= _RATE_LIMIT:
            return Response(
                content='{"detail":"Rate limit exceeded. Please wait before submitting another assessment."}',
                status_code=429,
                media_type="application/json",
                headers={"Retry-After": str(_WINDOW_SECONDS)},
            )

        window.append(now)
        self._store[ip] = window
        return await call_next(request)  # type: ignore[misc]

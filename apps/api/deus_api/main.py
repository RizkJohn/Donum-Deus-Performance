from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .db.session import init_db
from .middleware import (
    APIKeyMiddleware,
    RateLimitMiddleware,
    RequestSizeLimitMiddleware,
    SecurityHeadersMiddleware,
)
from .routes import assess, generate, health


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="Deus Performance Engine API",
        version="0.1.0",
        lifespan=lifespan,
        # Suppress interactive docs in production to avoid exposing the API surface.
        docs_url=None if settings.disable_docs else "/docs",
        redoc_url=None if settings.disable_docs else "/redoc",
        openapi_url=None if settings.disable_docs else "/openapi.json",
    )

    # CORS: allow configured origins with explicit method/header allowlist only.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[o.strip() for o in settings.cors_origins.split(",")],
        allow_credentials=False,
        allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "X-API-Key"],
    )

    # Security headers on every response.
    app.add_middleware(SecurityHeadersMiddleware)

    # Reject oversized request bodies before they reach route handlers.
    app.add_middleware(
        RequestSizeLimitMiddleware, max_bytes=settings.max_request_bytes
    )

    # API key gate (no-op when API_KEY env var is unset — safe for local dev).
    app.add_middleware(APIKeyMiddleware, api_key=settings.api_key)

    # Tiered per-IP rate limiting.
    app.add_middleware(RateLimitMiddleware)

    app.include_router(health.router)
    app.include_router(generate.router)
    app.include_router(assess.router)
    return app


app = create_app()

from contextlib import asynccontextmanager

import sentry_sdk
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .db.session import init_db
from .middleware import RateLimitMiddleware
from .routes import assess, auth, billing, correspondence, feedback, generate, health, me


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    if settings.sentry_dsn:
        # No-op unless SENTRY_DSN is set (dev/test never set it) — auto-hooks
        # FastAPI/Starlette exception capture, nothing else to wire.
        sentry_sdk.init(dsn=settings.sentry_dsn, environment=settings.environment)
    app = FastAPI(
        title="Deus Performance Engine API",
        version="0.1.0",
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[o.strip() for o in settings.cors_origins.split(",")],
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RateLimitMiddleware)
    app.include_router(health.router)
    app.include_router(generate.router)
    app.include_router(assess.router)
    app.include_router(feedback.router)
    app.include_router(auth.router)
    app.include_router(me.router)
    app.include_router(billing.router)
    app.include_router(correspondence.router)
    return app


app = create_app()

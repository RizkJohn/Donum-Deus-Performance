from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .routes import assess, auth, billing, generate, health


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Schema is managed by Alembic (alembic upgrade head).
    # Nothing to do on startup.
    yield


def create_app() -> FastAPI:
    settings = get_settings()
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
    app.include_router(health.router)
    app.include_router(auth.router)
    app.include_router(billing.router)
    app.include_router(generate.router)
    app.include_router(assess.router)
    return app


app = create_app()

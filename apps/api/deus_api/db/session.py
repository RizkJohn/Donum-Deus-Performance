from collections.abc import AsyncIterator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from ..config import get_settings
from .models import Base

_engine = None
_sessionmaker: async_sessionmaker[AsyncSession] | None = None


def get_engine():
    global _engine, _sessionmaker
    if _engine is None:
        _engine = create_async_engine(get_settings().database_url)
        _sessionmaker = async_sessionmaker(_engine, expire_on_commit=False)
    return _engine


async def init_db() -> None:
    engine = get_engine()
    async with engine.begin() as conn:
        # Milestone 1: create_all on startup. Alembic migrations come with
        # the first schema change that needs data preservation.
        await conn.run_sync(Base.metadata.create_all)


async def get_db() -> AsyncIterator[AsyncSession]:
    get_engine()
    assert _sessionmaker is not None
    async with _sessionmaker() as session:
        yield session

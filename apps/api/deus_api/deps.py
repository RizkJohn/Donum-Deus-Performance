"""FastAPI dependency wiring."""

from typing import Annotated

from fastapi import Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from .config import get_settings
from .db.models import User
from .db.session import get_db
from .engine.library_loader import Library, get_library
from .engine.spec_loader import SpecLoader, get_spec_loader
from .llm.base import LLMProvider
from .llm.factory import build_provider
from .security import decode_access_token

_provider: LLMProvider | None = None


def _bearer_token(authorization: str | None) -> str | None:
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    return authorization.split(" ", 1)[1].strip()


async def get_optional_user(
    authorization: Annotated[str | None, Header()] = None,
    db: AsyncSession = Depends(get_db),
) -> User | None:
    token = _bearer_token(authorization)
    if token is None:
        return None
    user_id = decode_access_token(token)
    if user_id is None:
        return None
    return await db.get(User, user_id)


async def get_current_user(
    user: Annotated[User | None, Depends(get_optional_user)],
) -> User:
    if user is None:
        raise HTTPException(status_code=401, detail="authentication required")
    return user


def get_specs() -> SpecLoader:
    return get_spec_loader(get_settings().engine_spec_dir)


def get_lib() -> Library:
    return get_library(get_settings().data_dir)


def get_provider() -> LLMProvider:
    global _provider
    if _provider is None:
        _provider = build_provider(get_settings())
    return _provider

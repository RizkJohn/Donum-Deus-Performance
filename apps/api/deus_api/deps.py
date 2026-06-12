"""FastAPI dependency wiring."""

from .config import get_settings
from .engine.library_loader import Library, get_library
from .engine.spec_loader import SpecLoader, get_spec_loader
from .llm.base import LLMProvider
from .llm.factory import build_provider

_provider: LLMProvider | None = None


def get_specs() -> SpecLoader:
    return get_spec_loader(get_settings().engine_spec_dir)


def get_lib() -> Library:
    return get_library(get_settings().data_dir)


def get_provider() -> LLMProvider:
    global _provider
    if _provider is None:
        _provider = build_provider(get_settings())
    return _provider

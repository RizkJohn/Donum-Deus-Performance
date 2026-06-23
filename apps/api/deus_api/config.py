"""Application settings.

ENGINE_SPEC_DIR points at the canonical `packages/engine/` markdown specs (lowercase
files are the source of truth per CLAUDE.md). DATA_DIR holds the derived
JSON artifacts generated from those specs by scripts/port_library.py.
"""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_API_ROOT = Path(__file__).resolve().parent.parent
_REPO_ROOT = _API_ROOT.parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite+aiosqlite:///./deus.db"
    llm_provider: str = "mock"  # mock | claude
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-opus-4-8"
    engine_spec_dir: Path = _REPO_ROOT / "packages" / "engine"
    data_dir: Path = _API_ROOT / "data"
    cors_origins: str = "http://localhost:3000"
    max_attempts: int = 3


@lru_cache
def get_settings() -> Settings:
    return Settings()

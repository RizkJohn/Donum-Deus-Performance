"""Application settings.

ENGINE_SPEC_DIR points at the canonical `engine/` markdown specs (lowercase
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
    engine_spec_dir: Path = _REPO_ROOT / "engine"
    data_dir: Path = _API_ROOT / "data"
    cors_origins: str = "http://localhost:3000"
    max_attempts: int = 3
    # Security: set API_KEY in production to require X-API-Key on all endpoints
    api_key: str = ""
    # Set DISABLE_DOCS=true in production to suppress /docs and /redoc
    disable_docs: bool = False
    # Maximum request body size in bytes (default 64 KB)
    max_request_bytes: int = 65_536


@lru_cache
def get_settings() -> Settings:
    return Settings()

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

    # Auth
    secret_key: str = "dev-secret-change-in-production"
    web_url: str = "http://localhost:3000"

    # Email (console | resend)
    email_provider: str = "console"
    resend_api_key: str = ""

    # Stripe
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_price_engine: str = ""    # Self-directed tier
    stripe_price_hybrid: str = ""    # Coach-reviewed tier
    stripe_price_premium: str = ""   # Coach-led tier


@lru_cache
def get_settings() -> Settings:
    return Settings()

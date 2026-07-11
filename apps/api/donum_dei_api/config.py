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

    database_url: str = "sqlite+aiosqlite:///./donum_dei.db"
    llm_provider: str = "mock"  # mock | claude
    anthropic_api_key: str = ""
    # Tiered models (docs/RedesignGuide.md): Opus reasons over the assessment,
    # Sonnet does high-volume session generation, Haiku powers the chat layer.
    # The Assessment Layer is deterministic by default, so these only bill when
    # LLM_PROVIDER=claude. `anthropic_model` kept as a back-compat alias.
    assessment_model: str = "claude-opus-4-8"
    generation_model: str = "claude-sonnet-4-6"
    chat_model: str = "claude-haiku-4-5-20251001"
    anthropic_model: str = "claude-sonnet-4-6"
    engine_spec_dir: Path = _REPO_ROOT / "engine"
    data_dir: Path = _API_ROOT / "data"
    cors_origins: str = "http://localhost:3000"
    max_attempts: int = 3

    # Accounts — JWT is stateless; this must be overridden in production.
    auth_jwt_secret: str = "dev-insecure-secret-change-me-before-any-real-deploy"
    auth_token_ttl_days: int = 30

    # Stripe — subscription checkout/portal/webhook. Empty key => billing
    # routes return a clear "not configured" error instead of an SDK crash.
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_price_foundation: str = ""
    stripe_price_practice: str = ""
    stripe_price_stewardship: str = ""

    # Email — mirrors LLM_PROVIDER: mock is default, fully offline.
    email_provider: str = "mock"  # mock | resend
    resend_api_key: str = ""
    email_from: str = "Donum Dei Performance <programs@donumdeiperformance.com>"
    web_url: str = "http://localhost:3000"


@lru_cache
def get_settings() -> Settings:
    return Settings()

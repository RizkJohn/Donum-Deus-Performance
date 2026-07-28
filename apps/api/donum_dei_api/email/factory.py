"""Provider selection — mirrors llm/factory.py. EMAIL_PROVIDER=mock (default)
never touches a network SDK."""

from ..config import Settings, get_settings
from .base import EmailProvider
from .mock import MockEmailProvider
from .resend_provider import ResendEmailProvider

_provider: EmailProvider | None = None


def build_email_provider(settings: Settings) -> EmailProvider:
    if settings.email_provider == "mock":
        return MockEmailProvider()
    if settings.email_provider == "resend":
        return ResendEmailProvider(
            api_key=settings.resend_api_key, from_address=settings.email_from
        )
    raise ValueError(f"unknown EMAIL_PROVIDER: {settings.email_provider!r}")


def get_email_provider() -> EmailProvider:
    global _provider
    if _provider is None:
        _provider = build_email_provider(get_settings())
    return _provider


def reset_email_provider() -> None:
    """Test-only hook — see tests/conftest.py's `client` fixture."""
    global _provider
    _provider = None

"""Provider selection. LLM_PROVIDER=mock (default) never touches a network
SDK, so the whole stack runs with no API key. Swapping to Claude is a
one-line env change; new providers (Qwen3 / DeepSeek / OpenAI) implement
LLMProvider in one file and register here."""

from ..config import Settings
from .base import LLMProvider
from .claude import ClaudeProvider
from .mock import MockProvider


def build_provider(settings: Settings) -> LLMProvider:
    if settings.llm_provider == "mock":
        return MockProvider()
    if settings.llm_provider == "claude":
        # Default model is the generation tier (Sonnet); the pipeline passes an
        # explicit per-call model so each stage uses its tier.
        return ClaudeProvider(
            api_key=settings.anthropic_api_key, model=settings.generation_model
        )
    raise ValueError(f"unknown LLM_PROVIDER: {settings.llm_provider!r}")

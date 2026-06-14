"""Offline tests for ClaudeProvider — mocks the Anthropic SDK entirely.

All tests run without a network connection or API key.
"""

import json
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from deus_api.llm.claude import ClaudeProvider


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_usage(input_tokens: int = 100, output_tokens: int = 200):
    return SimpleNamespace(input_tokens=input_tokens, output_tokens=output_tokens)


def _make_response(
    *,
    stop_reason: str = "end_turn",
    text: str = '{"weekly_split": []}',
    input_tokens: int = 100,
    output_tokens: int = 200,
):
    content_block = SimpleNamespace(type="text", text=text)
    return SimpleNamespace(
        stop_reason=stop_reason,
        content=[content_block],
        usage=_make_usage(input_tokens, output_tokens),
    )


_SCHEMA = {"type": "object", "properties": {"weekly_split": {"type": "array"}}}

_GENERATE_KWARGS = dict(
    system="sys prompt",
    developer="dev prompt",
    user="user prompt",
    json_schema=_SCHEMA,
)


@pytest.fixture
def mock_client():
    """Patch anthropic.AsyncAnthropic and return the mock messages object."""
    with patch("deus_api.llm.claude.anthropic.AsyncAnthropic") as MockClass:
        mock_messages = AsyncMock()
        MockClass.return_value.messages = mock_messages
        yield mock_messages


# ---------------------------------------------------------------------------
# Construction
# ---------------------------------------------------------------------------

def test_provider_name():
    assert ClaudeProvider.name == "claude"


def test_default_model():
    with patch("deus_api.llm.claude.anthropic.AsyncAnthropic"):
        p = ClaudeProvider(api_key="sk-test")
    assert p._model == "claude-opus-4-8"


def test_custom_model():
    with patch("deus_api.llm.claude.anthropic.AsyncAnthropic"):
        p = ClaudeProvider(api_key="sk-test", model="claude-haiku-4-5-20251001")
    assert p._model == "claude-haiku-4-5-20251001"


# ---------------------------------------------------------------------------
# Happy path
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_generate_returns_parsed_json(mock_client):
    payload = {"weekly_split": [], "sessions": [], "conditioning": [], "mobility": [], "flags": []}
    mock_client.create = AsyncMock(return_value=_make_response(text=json.dumps(payload)))

    with patch("deus_api.llm.claude.anthropic.AsyncAnthropic") as MockClass:
        MockClass.return_value.messages = mock_client
        provider = ClaudeProvider(api_key="sk-test")

    result = await provider.generate(**_GENERATE_KWARGS)

    assert result.refused is False
    assert result.parsed == payload
    assert result.raw_text == json.dumps(payload)
    assert result.stop_reason == "end_turn"


@pytest.mark.asyncio
async def test_generate_meta_captured(mock_client):
    mock_client.create = AsyncMock(
        return_value=_make_response(text="{}", input_tokens=42, output_tokens=99)
    )

    with patch("deus_api.llm.claude.anthropic.AsyncAnthropic") as MockClass:
        MockClass.return_value.messages = mock_client
        provider = ClaudeProvider(api_key="sk-test")

    result = await provider.generate(**_GENERATE_KWARGS)

    assert result.meta["input_tokens"] == 42
    assert result.meta["output_tokens"] == 99
    assert result.meta["model"] == "claude-opus-4-8"


# ---------------------------------------------------------------------------
# Refusal path
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_generate_refusal_returns_refused_result(mock_client):
    mock_client.create = AsyncMock(
        return_value=_make_response(stop_reason="refusal", text="")
    )

    with patch("deus_api.llm.claude.anthropic.AsyncAnthropic") as MockClass:
        MockClass.return_value.messages = mock_client
        provider = ClaudeProvider(api_key="sk-test")

    result = await provider.generate(**_GENERATE_KWARGS)

    assert result.refused is True
    assert result.stop_reason == "refusal"
    assert result.parsed is None


# ---------------------------------------------------------------------------
# Malformed JSON
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_generate_malformed_json_sets_parsed_none(mock_client):
    mock_client.create = AsyncMock(
        return_value=_make_response(text="not valid json {{{")
    )

    with patch("deus_api.llm.claude.anthropic.AsyncAnthropic") as MockClass:
        MockClass.return_value.messages = mock_client
        provider = ClaudeProvider(api_key="sk-test")

    result = await provider.generate(**_GENERATE_KWARGS)

    assert result.parsed is None
    assert result.raw_text == "not valid json {{{"
    assert result.refused is False


# ---------------------------------------------------------------------------
# SDK call shape — verify we're sending the right parameters
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_generate_calls_sdk_with_correct_shape():
    """Verify output_config, thinking, system blocks, and model are correct."""
    captured = {}

    async def fake_create(**kwargs):
        captured.update(kwargs)
        return _make_response(text="{}")

    with patch("deus_api.llm.claude.anthropic.AsyncAnthropic") as MockClass:
        mock_messages = MagicMock()
        mock_messages.create = fake_create
        MockClass.return_value.messages = mock_messages
        provider = ClaudeProvider(api_key="sk-test")

    await provider.generate(**_GENERATE_KWARGS)

    # model
    assert captured["model"] == "claude-opus-4-8"

    # thinking — adaptive only (budget_tokens would 400 on Opus 4.8)
    assert captured["thinking"] == {"type": "adaptive"}

    # output_config — not deprecated output_format
    assert "output_config" in captured
    assert captured["output_config"]["format"]["type"] == "json_schema"
    assert captured["output_config"]["format"]["schema"] is _SCHEMA
    assert "output_format" not in captured

    # system — two blocks with cache_control
    sys_blocks = captured["system"]
    assert len(sys_blocks) == 2
    for block in sys_blocks:
        assert block["type"] == "text"
        assert block["cache_control"] == {"type": "ephemeral"}
    assert sys_blocks[0]["text"] == "sys prompt"
    assert sys_blocks[1]["text"] == "dev prompt"

    # messages — user role
    messages = captured["messages"]
    assert len(messages) == 1
    assert messages[0]["role"] == "user"
    assert messages[0]["content"] == "user prompt"


# ---------------------------------------------------------------------------
# Empty content list (edge case)
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_generate_empty_content_gives_empty_raw_text():
    """If the response has no text blocks, raw_text is '' and parsed is None."""
    response = SimpleNamespace(
        stop_reason="end_turn",
        content=[],
        usage=_make_usage(),
    )

    with patch("deus_api.llm.claude.anthropic.AsyncAnthropic") as MockClass:
        mock_messages = AsyncMock()
        mock_messages.create = AsyncMock(return_value=response)
        MockClass.return_value.messages = mock_messages
        provider = ClaudeProvider(api_key="sk-test")

    result = await provider.generate(**_GENERATE_KWARGS)

    assert result.raw_text == ""
    assert result.parsed is None
    assert result.refused is False

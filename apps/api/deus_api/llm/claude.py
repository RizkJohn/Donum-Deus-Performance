"""Claude provider (Anthropic SDK).

- Schema-constrained JSON via output_config.format (no prose, no prefill —
  prefills 400 on Opus 4.8).
- SYSTEM + DEVELOPER map into the `system` blocks (stable content first,
  cache_control on both for prompt caching across requests).
- stop_reason == "refusal" is checked before reading content.
"""

import json
from typing import Any

import anthropic

from .base import GenerationResult


class ClaudeProvider:
    name = "claude"

    def __init__(self, api_key: str, model: str = "claude-opus-4-8"):
        self._client = anthropic.AsyncAnthropic(api_key=api_key or None)
        self._model = model

    async def generate(
        self,
        *,
        system: str,
        developer: str,
        user: str,
        json_schema: dict,
        context: dict[str, Any] | None = None,
    ) -> GenerationResult:
        response = await self._client.messages.create(
            model=self._model,
            max_tokens=16000,
            thinking={"type": "adaptive"},
            system=[
                {
                    "type": "text",
                    "text": system,
                    "cache_control": {"type": "ephemeral"},
                },
                {
                    "type": "text",
                    "text": developer,
                    "cache_control": {"type": "ephemeral"},
                },
            ],
            output_config={"format": {"type": "json_schema", "schema": json_schema}},
            messages=[{"role": "user", "content": user}],
        )

        if response.stop_reason == "refusal":
            return GenerationResult(refused=True, stop_reason="refusal")

        text = next((b.text for b in response.content if b.type == "text"), "")
        parsed: dict | None
        try:
            parsed = json.loads(text)
        except (json.JSONDecodeError, ValueError):
            parsed = None
        return GenerationResult(
            raw_text=text,
            parsed=parsed,
            stop_reason=response.stop_reason,
            meta={
                "model": self._model,
                "input_tokens": response.usage.input_tokens,
                "output_tokens": response.usage.output_tokens,
            },
        )

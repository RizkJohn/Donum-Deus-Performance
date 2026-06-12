"""Provider-agnostic LLM interface.

The interface is role-shaped (system/developer/user) per
engine/prompt_wrapper.md, and takes the output JSON schema so each provider
can enforce structured output its own way. `context` carries the
PrecomputedPlan + library for providers that build deterministically (mock);
network providers ignore it (the same data is in the prompts).
"""

from typing import Any, Protocol, runtime_checkable

from pydantic import BaseModel


class GenerationResult(BaseModel):
    raw_text: str = ""
    parsed: dict | None = None
    refused: bool = False
    stop_reason: str | None = None
    meta: dict = {}


@runtime_checkable
class LLMProvider(Protocol):
    name: str

    async def generate(
        self,
        *,
        system: str,
        developer: str,
        user: str,
        json_schema: dict,
        context: dict[str, Any] | None = None,
    ) -> GenerationResult: ...

"""Provider-agnostic email interface — mirrors llm/base.py exactly. `mock` is
the default provider so the whole pipeline stays offline until a real
EMAIL_PROVIDER + API key is configured."""

from typing import Protocol, runtime_checkable

from pydantic import BaseModel


class SendResult(BaseModel):
    sent: bool
    provider_id: str | None = None


@runtime_checkable
class EmailProvider(Protocol):
    name: str

    async def send(
        self, *, to: str, subject: str, html: str, reply_to: str | None = None
    ) -> SendResult: ...

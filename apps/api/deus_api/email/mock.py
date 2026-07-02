"""Deterministic offline provider — no network, no API key. Records every
send in-memory so tests can assert on the outbox (mirrors llm/mock.py)."""

from .base import SendResult


class MockEmailProvider:
    name = "mock"

    def __init__(self) -> None:
        self.outbox: list[dict] = []

    async def send(
        self, *, to: str, subject: str, html: str, reply_to: str | None = None
    ) -> SendResult:
        self.outbox.append({"to": to, "subject": subject, "html": html, "reply_to": reply_to})
        return SendResult(sent=True, provider_id=f"mock-{len(self.outbox)}")

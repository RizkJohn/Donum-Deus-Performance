"""Real provider — Resend (https://resend.com). Requires RESEND_API_KEY and a
verified sending domain in the Resend dashboard; EMAIL_FROM must be an address
on that domain."""

import resend

from .base import SendResult


class ResendEmailProvider:
    name = "resend"

    def __init__(self, api_key: str, from_address: str):
        resend.api_key = api_key
        self._from = from_address

    async def send(self, *, to: str, subject: str, html: str) -> SendResult:
        result = resend.Emails.send(
            {"from": self._from, "to": [to], "subject": subject, "html": html}
        )
        return SendResult(sent=True, provider_id=result.get("id"))

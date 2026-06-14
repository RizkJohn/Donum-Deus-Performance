"""Production email provider via Resend."""

import resend


_HTML = """\
<div style="font-family:monospace;max-width:480px;margin:40px auto;color:#1a2a1a">
  <p style="font-size:11px;text-transform:uppercase;letter-spacing:.2em;color:#5a7a4a">
    Deus Performance
  </p>
  <h1 style="font-size:24px;margin:16px 0 8px">Sign in</h1>
  <p style="color:#4a5a4a;line-height:1.7">
    Click the link below to sign in. It expires in 1 hour.
  </p>
  <a href="{link}"
     style="display:inline-block;margin:24px 0;padding:12px 24px;
            background:#7caf58;color:#0b0f0c;text-decoration:none;
            font-size:11px;text-transform:uppercase;letter-spacing:.15em">
    Sign in to Deus Performance →
  </a>
  <p style="font-size:11px;color:#8a9a8a">
    If you didn't request this, you can ignore it.
  </p>
</div>
"""


class ResendEmailProvider:
    def __init__(self, api_key: str, from_email: str = "noreply@deusperformance.com"):
        resend.api_key = api_key
        self._from = from_email

    async def send_magic_link(self, *, to: str, link: str) -> None:
        resend.Emails.send({
            "from": self._from,
            "to": to,
            "subject": "Your Deus Performance sign-in link",
            "html": _HTML.format(link=link),
        })

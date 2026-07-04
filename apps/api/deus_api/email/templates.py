"""Plain, brand-consistent HTML email bodies. Kept deliberately simple (no
templating engine) — two short functions are enough for the two triggers
this app has today."""

from ..config import get_settings

_WRAP_OPEN = (
    '<div style="font-family:Georgia,serif;color:#1d2a44;max-width:480px;'
    'margin:0 auto;padding:32px 24px;">'
    '<p style="font-style:italic;color:#94763c;font-size:13px;'
    'letter-spacing:0.04em;margin:0 0 18px;">Donum Dei.</p>'
)
_WRAP_CLOSE = (
    '<p style="font-size:11px;color:#857f6e;margin-top:32px;">'
    "Deus Performance is a practice of performance education. It does not "
    "constitute medical advice, rehabilitation guidance, or clinical counsel "
    "of any kind.</p></div>"
)


def welcome_email() -> tuple[str, str]:
    subject = "Welcome to Deus Performance"
    html = (
        _WRAP_OPEN
        + "<h1 style=\"font-size:20px;margin:0 0 12px;\">Your account is ready.</h1>"
        + "<p>The body is a gift. Train it accordingly. Your dashboard keeps every "
        + "program the engine builds for you in one place, adapting week to week "
        + "as you check in.</p>"
        + _WRAP_CLOSE
    )
    return subject, html


def data_request_email(action: str, token: str) -> tuple[str, str]:
    """Confirmation code for a GDPR export/erasure request. Possession of the
    emailed token is the proof of address ownership the /v1/data endpoints
    require. The token is wrapped in <code data-token> so tests (and any
    future web UI) can extract it without parsing prose."""
    ttl = get_settings().data_token_ttl_minutes
    if action == "erase":
        subject = "Confirm deletion of your Deus Performance data"
        intro = (
            "<p>A request was made to <strong>permanently delete</strong> all "
            "data held for this email address — programs, training history, "
            "and any account. This cannot be undone.</p>"
        )
    else:
        subject = "Your Deus Performance data export code"
        intro = (
            "<p>A request was made to export all data held for this email "
            "address.</p>"
        )
    html = (
        _WRAP_OPEN
        + intro
        + "<p>Your confirmation code:</p>"
        + f'<p><code data-token style="font-size:15px;letter-spacing:0.02em;">{token}</code></p>'
        + f"<p>It expires in {ttl} minutes. If you did not make this request, "
        + "ignore this email — nothing happens without the code.</p>"
        + _WRAP_CLOSE
    )
    return subject, html


def password_reset_email(token: str) -> tuple[str, str]:
    ttl = get_settings().data_token_ttl_minutes
    subject = "Reset your Deus Performance password"
    html = (
        _WRAP_OPEN
        + "<p>A password reset was requested for your account. Your reset code:</p>"
        + f'<p><code data-token style="font-size:15px;letter-spacing:0.02em;">{token}</code></p>'
        + f"<p>It expires in {ttl} minutes. If you did not make this request, "
        + "ignore this email — your password is unchanged.</p>"
        + _WRAP_CLOSE
    )
    return subject, html


def program_ready_email(program_id: str) -> tuple[str, str]:
    web_url = get_settings().web_url.rstrip("/")
    subject = "Your weekly program is ready"
    html = (
        _WRAP_OPEN
        + "<h1 style=\"font-size:20px;margin:0 0 12px;\">This week, ordered.</h1>"
        + "<p>The engine has built and validated your program.</p>"
        + f'<p><a href="{web_url}/program/{program_id}" '
        + 'style="color:#1f3a5f;font-weight:bold;">View your program</a></p>'
        + "<p>Sign in to your dashboard to see it alongside every program that "
        + "came before it.</p>"
        + _WRAP_CLOSE
    )
    return subject, html

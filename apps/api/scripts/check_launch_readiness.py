#!/usr/bin/env python3
"""Launch-readiness gate: reports which production secrets are missing or
still at their insecure/offline dev defaults, without ever printing the
actual secret values.

`ENVIRONMENT=development` (default): informational only, always exits 0 --
mock providers and dev defaults are expected while building locally.
`ENVIRONMENT=production`: any CRITICAL finding exits 1, so this can gate a
deploy (`make check-env`) the same way CI gates a merge.

Run from apps/api/: `python3 scripts/check_launch_readiness.py`
"""

import sys
from dataclasses import dataclass
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from deus_api.config import get_settings  # noqa: E402

DEV_JWT_SECRET = "dev-insecure-secret-change-me-before-any-real-deploy"


@dataclass
class Finding:
    ok: bool
    critical: bool
    label: str
    detail: str


def _check(settings) -> list[Finding]:
    findings: list[Finding] = []

    findings.append(Finding(
        ok=settings.auth_jwt_secret != DEV_JWT_SECRET,
        critical=True,
        label="AUTH_JWT_SECRET",
        detail="still the dev default — every issued session token is forgeable"
        if settings.auth_jwt_secret == DEV_JWT_SECRET
        else "overridden",
    ))

    is_sqlite = settings.database_url.startswith("sqlite")
    findings.append(Finding(
        ok=not is_sqlite,
        critical=True,
        label="DATABASE_URL",
        detail="pointing at local sqlite — set your production Postgres URL"
        if is_sqlite else "set to a non-sqlite database",
    ))

    if settings.llm_provider == "claude":
        findings.append(Finding(
            ok=bool(settings.anthropic_api_key),
            critical=True,
            label="ANTHROPIC_API_KEY",
            detail="LLM_PROVIDER=claude but no key set — /v1/generate will fail"
            if not settings.anthropic_api_key else "set",
        ))
    else:
        findings.append(Finding(
            ok=False,
            critical=False,
            label="LLM_PROVIDER",
            detail="mock — real users will get demo/deterministic output, not "
            "live-generated programs",
        ))

    stripe_fields = {
        "STRIPE_SECRET_KEY": settings.stripe_secret_key,
        "STRIPE_WEBHOOK_SECRET": settings.stripe_webhook_secret,
        "STRIPE_PRICE_FOUNDATION": settings.stripe_price_foundation,
        "STRIPE_PRICE_PRACTICE": settings.stripe_price_practice,
        "STRIPE_PRICE_STEWARDSHIP": settings.stripe_price_stewardship,
    }
    set_count = sum(1 for v in stripe_fields.values() if v)
    if set_count == 0:
        findings.append(Finding(
            ok=False, critical=False, label="Stripe",
            detail="not configured — billing routes return a clear error; "
            "fine until you're ready to take payments",
        ))
    elif set_count < len(stripe_fields):
        missing = [k for k, v in stripe_fields.items() if not v]
        findings.append(Finding(
            ok=False, critical=True, label="Stripe",
            detail=f"partially configured — missing {', '.join(missing)}",
        ))
    else:
        findings.append(Finding(ok=True, critical=True, label="Stripe", detail="fully configured"))

    if settings.email_provider == "resend":
        findings.append(Finding(
            ok=bool(settings.resend_api_key),
            critical=True,
            label="RESEND_API_KEY",
            detail="EMAIL_PROVIDER=resend but no key set — sends will fail"
            if not settings.resend_api_key else "set",
        ))
    else:
        findings.append(Finding(
            ok=False, critical=False, label="EMAIL_PROVIDER",
            detail="mock — welcome/program-ready emails are not actually sent",
        ))

    for label, value in (("CORS_ORIGINS", settings.cors_origins), ("WEB_URL", settings.web_url)):
        is_local = "localhost" in value
        findings.append(Finding(
            ok=not is_local, critical=True, label=label,
            detail=f"still {value!r} — point at your production domain" if is_local else "set",
        ))

    return findings


def main() -> int:
    settings = get_settings()
    findings = _check(settings)
    hard_gate = settings.environment == "production"

    print(f"ENVIRONMENT={settings.environment} "
          f"({'hard gate — critical findings fail the build' if hard_gate else 'informational only'})\n")

    failed_critical = False
    for f in findings:
        if f.ok:
            icon = "OK  "
        elif f.critical:
            icon = "FAIL" if hard_gate else "WARN"
        else:
            icon = "info"
        print(f"[{icon}] {f.label}: {f.detail}")
        if hard_gate and f.critical and not f.ok:
            failed_critical = True

    print()
    if hard_gate and failed_critical:
        print("Launch readiness: NOT READY — fix the FAIL items above.")
        return 1
    print("Launch readiness: OK" if hard_gate else
          "Development mode — re-run with ENVIRONMENT=production before deploying "
          "to see this as a hard gate.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

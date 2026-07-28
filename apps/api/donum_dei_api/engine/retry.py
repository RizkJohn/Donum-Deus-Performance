"""engine/retry_policy.md — max 3 attempts; on failure return error context
constrained to the offending fields; on repeat failure instruct
simplification (reduce exercise count, drop optional conditioning)."""

from .qc.validator import QCReport


def build_retry_feedback(report: QCReport, attempt: int) -> str:
    lines = [
        "PREVIOUS ATTEMPT REJECTED BY QUALITY CONTROL.",
        f"Fix ONLY the offending fields: {', '.join(report.offending_fields) or 'output'}.",
        "Failures:",
    ]
    lines += [f"- {reason}" for reason in report.reasons[:15]]
    if attempt >= 2:
        lines.append(
            "SIMPLIFY: reduce exercise count to the minimum satisfying weekly "
            "movement coverage; remove optional conditioning."
        )
    return "\n".join(lines)

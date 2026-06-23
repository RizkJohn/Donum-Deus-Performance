"""QC gate orchestrator: runs every hard-rule check; if ANY fails, the
program is rejected (retry or UNSATISFIABLE — never a partial plan)."""

from dataclasses import dataclass

from ...models.decision import PrecomputedPlan
from ...models.input_contract import GenerateRequest
from ...models.program import Program
from ..library_loader import Library
from . import checks


@dataclass
class QCReport:
    passed: bool
    failures: list[checks.CheckResult]
    program: Program | None

    @property
    def reasons(self) -> list[str]:
        return [r for f in self.failures for r in f.reasons]

    @property
    def offending_fields(self) -> list[str]:
        return sorted({f for c in self.failures for f in c.offending_fields})


def validate(
    raw: dict,
    req: GenerateRequest,
    plan: PrecomputedPlan,
    library: Library,
) -> QCReport:
    schema_result, program = checks.check_schema_valid(raw)
    if program is None:
        return QCReport(passed=False, failures=[schema_result], program=None)

    results = [
        schema_result,
        checks.check_cns_limits(program, req),
        checks.check_pre_sport_low_cns(program, req),
        checks.check_movement_coverage(program, library),
        checks.check_block_order(program),
        checks.check_library_only(program, library),
        checks.check_volume(program),
        checks.check_intensity_safety(program),
        checks.check_fatigue_applied(program, plan),
        checks.check_progression_flag(program, plan),
        checks.check_plan_adherence(program, plan),
        checks.check_injury_blocks(program, plan, library),
    ]
    failures = [r for r in results if not r.passed]
    return QCReport(passed=not failures, failures=failures, program=program)

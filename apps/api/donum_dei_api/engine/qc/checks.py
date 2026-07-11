"""One check function per hard engine rule (engine/quality_control.md +
engine/engine_instructions.md). Each returns a CheckResult; the validator
aggregates. All checks run on every candidate program regardless of what the
LLM claims — the QC gate is the safety backstop."""

from dataclasses import dataclass, field

from pydantic import ValidationError

from ...models.decision import COVERAGE_GROUPS, PrecomputedPlan
from ...models.input_contract import DAY_ORDER, GenerateRequest
from ...models.program import BLOCK_ORDER, Program
from ..library_loader import Library

MAX_EXERCISES_PER_SESSION = 8


@dataclass
class CheckResult:
    name: str
    passed: bool
    reasons: list[str] = field(default_factory=list)
    offending_fields: list[str] = field(default_factory=list)


def _fail(name: str, reasons: list[str], fields: list[str]) -> CheckResult:
    return CheckResult(name=name, passed=False, reasons=reasons, offending_fields=fields)


def _ok(name: str) -> CheckResult:
    return CheckResult(name=name, passed=True)


def check_schema_valid(raw: dict) -> tuple[CheckResult, Program | None]:
    try:
        program = Program.model_validate(raw)
        return _ok("schema_valid"), program
    except ValidationError as e:
        reasons = [f"{'.'.join(str(p) for p in err['loc'])}: {err['msg']}" for err in e.errors()[:10]]
        return _fail("schema_valid", reasons, ["<structure>"]), None


def check_cns_limits(program: Program) -> CheckResult:
    highs = [d.day for d in program.weekly_split if d.cns == "High"]
    reasons = []
    if len(highs) > 2:
        reasons.append(f"{len(highs)} High-CNS days; max is 2")
    idxs = sorted(DAY_ORDER.index(d) for d in highs)
    for a, b in zip(idxs, idxs[1:]):
        if b - a == 1:
            reasons.append(f"consecutive High-CNS days: {DAY_ORDER[a]}, {DAY_ORDER[b]}")
    if reasons:
        return _fail("cns_limits", reasons, ["weekly_split"])
    return _ok("cns_limits")


def check_pre_sport_low_cns(program: Program, req: GenerateRequest) -> CheckResult:
    sport_days = {d for days in req.schedule.sport_days.values() for d in days}
    reasons = []
    for split_day in program.weekly_split:
        next_day = DAY_ORDER[(DAY_ORDER.index(split_day.day) + 1) % 7]
        if next_day in sport_days and split_day.cns != "Low":
            reasons.append(f"{split_day.day} precedes sport day {next_day} but is High CNS")
    if reasons:
        return _fail("pre_sport_low_cns", reasons, ["weekly_split"])
    return _ok("pre_sport_low_cns")


def check_movement_coverage(program: Program, library: Library) -> CheckResult:
    patterns: set[str] = set()
    for session in program.sessions:
        for block in session.blocks:
            for ex in block.exercises:
                entry = library.by_name.get(ex.name)
                if entry:
                    patterns.add(entry.pattern)
    missing = [
        group for group, group_patterns in COVERAGE_GROUPS.items()
        if not any(p in patterns for p in group_patterns)
    ]
    if missing:
        return _fail(
            "movement_coverage",
            [f"weekly movement coverage missing: {', '.join(missing)}"],
            ["sessions"],
        )
    return _ok("movement_coverage")


def check_block_order(program: Program) -> CheckResult:
    reasons = []
    for session in program.sessions:
        order = [BLOCK_ORDER.index(b.type) for b in session.blocks]
        if order != sorted(order) or len(set(order)) != len(order):
            reasons.append(f"{session.day}: blocks out of canonical order or duplicated")
    split_idx = [DAY_ORDER.index(d.day) for d in program.weekly_split]
    if split_idx != sorted(split_idx) or len(set(split_idx)) != len(split_idx):
        reasons.append("weekly_split not ordered Mon→Sun")
    session_idx = [DAY_ORDER.index(s.day) for s in program.sessions]
    if session_idx != sorted(session_idx) or len(set(session_idx)) != len(session_idx):
        reasons.append("sessions not ordered Mon→Sun")
    if reasons:
        return _fail("block_order", reasons, ["sessions", "weekly_split"])
    return _ok("block_order")


def check_library_only(program: Program, library: Library) -> CheckResult:
    unknown = []
    for session in program.sessions:
        for block in session.blocks:
            for ex in block.exercises:
                if ex.name not in library.name_set:
                    unknown.append(f"{session.day}/{block.type}: '{ex.name}'")
    if unknown:
        return _fail(
            "library_only",
            [f"exercise not in library (exact match required): {u}" for u in unknown],
            ["sessions"],
        )
    return _ok("library_only")


def check_volume(program: Program) -> CheckResult:
    reasons = []
    for session in program.sessions:
        count = sum(len(b.exercises) for b in session.blocks)
        if count > MAX_EXERCISES_PER_SESSION:
            reasons.append(f"{session.day}: {count} exercises; max {MAX_EXERCISES_PER_SESSION}")
    if reasons:
        return _fail("volume_ok", reasons, ["sessions"])
    return _ok("volume_ok")


def check_intensity_safety(program: Program) -> CheckResult:
    """Never train to failure on primary lifts (Power/Strength): no AMRAP."""
    reasons = []
    for session in program.sessions:
        for block in session.blocks:
            if block.type not in ("Power", "Strength"):
                continue
            for ex in block.exercises:
                if ex.reps == "AMRAP":
                    reasons.append(f"{session.day}/{block.type}: AMRAP on primary lift '{ex.name}'")
    if reasons:
        return _fail("intensity_safety", reasons, ["sessions"])
    return _ok("intensity_safety")


def check_fatigue_applied(program: Program, plan: PrecomputedPlan) -> CheckResult:
    reasons = []
    for session in program.sessions:
        count = sum(len(b.exercises) for b in session.blocks)
        if count > plan.volume_budget:
            reasons.append(
                f"{session.day}: {count} exercises exceeds fatigue-adjusted budget {plan.volume_budget}"
            )
    if reasons:
        return _fail("fatigue_applied", reasons, ["sessions"])
    return _ok("fatigue_applied")


def check_progression_flag(program: Program, plan: PrecomputedPlan) -> CheckResult:
    if plan.flag not in program.flags:
        return _fail(
            "progression_flag",
            [f"flags must contain computed progression flag '{plan.flag}'"],
            ["flags"],
        )
    return _ok("progression_flag")


def check_plan_adherence(program: Program, plan: PrecomputedPlan) -> CheckResult:
    """The split must match the deterministic plan exactly (day + cns), and
    sessions must exist only on planned training days."""
    reasons = []
    expected = {(d.day, d.cns) for d in plan.days}
    actual = {(d.day, d.cns) for d in program.weekly_split}
    if expected != actual:
        reasons.append(f"weekly_split must match plan exactly; expected {sorted(expected)}")
    plan_days = {d.day for d in plan.days}
    for session in program.sessions:
        if session.day not in plan_days:
            reasons.append(f"session on {session.day} is not a planned training day")
    if reasons:
        return _fail("plan_adherence", reasons, ["weekly_split", "sessions"])
    return _ok("plan_adherence")


def check_injury_blocks(program: Program, plan: PrecomputedPlan, library: Library) -> CheckResult:
    blocked_names = {
        library.by_id[i].name for i in plan.blocked_exercise_ids if i in library.by_id
    }
    reasons = []
    for session in program.sessions:
        for block in session.blocks:
            for ex in block.exercises:
                if ex.name in blocked_names:
                    reasons.append(
                        f"{session.day}/{block.type}: '{ex.name}' is blocked by reported injuries"
                    )
    if reasons:
        return _fail("injury_blocks", reasons, ["sessions"])
    return _ok("injury_blocks")

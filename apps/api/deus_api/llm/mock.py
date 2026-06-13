"""Deterministic offline provider — no network, no API key.

Builds a valid program directly from the PrecomputedPlan + library passed in
`context`, so the full pipeline (decision → generation → QC) runs end-to-end
in tests and local dev. It applies the plan's goal-driven block prescriptions
and selects the simplest valid solution: one exercise per required coverage
group (engine rule: minimize exercise count while meeting requirements).

`fail_first=True` emits an out-of-library exercise on attempt 1 so the
retry/QC failure path is testable.
"""

from typing import Any

from ..engine.library_loader import Library
from ..models.decision import COVERAGE_GROUPS, PrecomputedPlan
from .base import GenerationResult

# pattern -> session block type
_BLOCK_FOR_PATTERN = {
    "jump": "Power",
    "rotation": "Core",
    "anti_rotation": "Core",
    "carry": "Accessory",
    "locomotion": "Accessory",
    "squat": "Strength",
    "hinge": "Strength",
    "push_h": "Strength",
    "push_v": "Strength",
    "pull_h": "Strength",
    "pull_v": "Strength",
}

_BLOCK_ORDER = ["Warmup", "Power", "Strength", "Accessory", "Core", "Mobility"]


class MockProvider:
    name = "mock"

    def __init__(self, fail_first: bool = False):
        self.fail_first = fail_first

    async def generate(
        self,
        *,
        system: str,
        developer: str,
        user: str,
        json_schema: dict,
        context: dict[str, Any] | None = None,
    ) -> GenerationResult:
        if context is None or "plan" not in context or "library" not in context:
            raise RuntimeError("MockProvider requires context={'plan', 'library'}")
        plan: PrecomputedPlan = context["plan"]
        library: Library = context["library"]
        attempt: int = context.get("attempt", 1)

        program = self._build_program(plan, library)
        if self.fail_first and attempt == 1:
            program["sessions"][0]["blocks"][0]["exercises"][0]["name"] = "Invented Movement"
        return GenerationResult(parsed=program, raw_text="", stop_reason="end_turn")

    def _pick_for_group(self, group: str, plan: PrecomputedPlan, library: Library):
        allowed = set(plan.allowed_exercise_ids)
        patterns = COVERAGE_GROUPS[group]
        candidates = [
            e for e in library.exercises if e.id in allowed and e.pattern in patterns
        ]
        return candidates[0] if candidates else None

    def _build_program(self, plan: PrecomputedPlan, library: Library) -> dict:
        picks = [
            e for g in plan.required_groups
            if (e := self._pick_for_group(g, plan, library)) is not None
        ]
        days = [d.day for d in plan.days]
        # round-robin picks across days (budget >= ceil(len(picks)/n) holds by
        # the decision engine's n*budget >= coverage feasibility check)
        per_day: dict[str, list] = {d: [] for d in days}
        for i, e in enumerate(picks):
            per_day[days[i % len(days)]].append(e)

        sessions = []
        for day in days:
            blocks: dict[str, list] = {}
            for e in per_day[day]:
                bt = _BLOCK_FOR_PATTERN[e.pattern]
                rx = plan.prescriptions[bt]
                blocks.setdefault(bt, []).append({
                    "name": e.name,
                    "sets": rx.sets, "reps": rx.reps, "rest": rx.rest, "notes": rx.notes,
                })
            ordered = [
                {"type": bt, "exercises": blocks[bt]}
                for bt in _BLOCK_ORDER if bt in blocks
            ]
            if ordered:
                sessions.append({"day": day, "blocks": ordered})

        return {
            "weekly_split": [d.model_dump() for d in plan.days],
            "sessions": sessions,
            "conditioning": [],
            "mobility": [],
            "flags": [plan.flag],
        }

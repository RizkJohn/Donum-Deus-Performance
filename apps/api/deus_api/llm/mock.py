"""Deterministic offline provider — no network, no API key.

Builds a valid program directly from the PrecomputedPlan + library passed in
`context`, so the full pipeline (decision → generation → QC) runs end-to-end
in tests and local dev. Prefers the simplest valid solution: exactly one
exercise per required coverage group (per engine_instructions: minimize
exercise count while meeting requirements).

`fail_first=True` emits an out-of-library exercise on attempt 1 so the
retry/QC failure path is testable.
"""

from typing import Any

from ..engine.library_loader import Library
from ..models.decision import COVERAGE_GROUPS, PrecomputedPlan
from .base import GenerationResult

# pattern -> session block
_BLOCK_FOR_PATTERN = {
    "jump": "Power",
    "rotation": "Core",
    "anti_rotation": "Core",
    "carry": "Accessory",
    "locomotion": "Accessory",
}

_BLOCK_PARAMS = {
    "Power": {"sets": 3, "reps": "3", "rest": "2 min", "notes": "Max intent, full recovery"},
    "Strength": {"sets": 4, "reps": "5", "rest": "2 min", "notes": "Leave 2 reps in reserve"},
    "Accessory": {"sets": 3, "reps": "8-12", "rest": "90 sec", "notes": "Controlled tempo"},
    "Core": {"sets": 3, "reps": "10", "rest": "60 sec", "notes": "Brace and breathe"},
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
        model: str | None = None,  # tier hint ignored offline
    ) -> GenerationResult:
        if context is None or "plan" not in context or "library" not in context:
            raise RuntimeError("MockProvider requires context={'plan', 'library'}")
        plan: PrecomputedPlan = context["plan"]
        library: Library = context["library"]
        attempt: int = context.get("attempt", 1)

        program = self._build_program(plan, library)
        if self.fail_first and attempt == 1:
            # corrupt one exercise name to exercise the QC/retry path
            program["sessions"][0]["blocks"][0]["exercises"][0]["name"] = "Invented Movement"
        return GenerationResult(parsed=program, raw_text="", stop_reason="end_turn")

    def _pick_for_group(self, group: str, plan: PrecomputedPlan, library: Library):
        """First allowed exercise covering the group, honouring the engine's
        variation-priority order (`allowed_exercise_ids` is pre-sorted novel →
        stale, aversions last). Prefer Low CNS so picks sit safely on Low-CNS
        days (jump has only High options — placed on a High day when one exists).
        """
        patterns = COVERAGE_GROUPS[group]
        candidates = [
            library.by_id[i]
            for i in plan.allowed_exercise_ids
            if library.by_id[i].pattern in patterns
        ]
        low = [e for e in candidates if e.cns == "Low"]
        pool = low or candidates
        return pool[0] if pool else None

    def _build_program(self, plan: PrecomputedPlan, library: Library) -> dict:
        picks = []
        for group in plan.required_groups:
            entry = self._pick_for_group(group, plan, library)
            if entry is not None:
                picks.append(entry)

        # distribute: jump goes to the first High day; rest round-robin over
        # days with remaining budget
        days = [d.day for d in plan.days]
        high_days = [d.day for d in plan.days if d.cns == "High"]
        per_day: dict[str, list] = {d: [] for d in days}

        jump_picks = [e for e in picks if e.pattern == "jump"]
        other_picks = [e for e in picks if e.pattern != "jump"]
        for e in jump_picks:
            target = high_days[0] if high_days else days[0]
            per_day[target].append(e)

        i = 0
        for e in other_picks:
            # next day with capacity
            for _ in range(len(days)):
                day = days[i % len(days)]
                i += 1
                if len(per_day[day]) < plan.volume_budget:
                    per_day[day].append(e)
                    break

        sessions = []
        for day in days:
            entries = per_day[day]
            if not entries:
                continue
            blocks: dict[str, list] = {}
            for e in entries:
                block_type = _BLOCK_FOR_PATTERN.get(
                    e.pattern, "Strength" if e.cns == "High" else "Accessory"
                )
                params = _BLOCK_PARAMS[block_type]
                blocks.setdefault(block_type, []).append({"name": e.name, **params})
            ordered = [
                {"type": bt, "exercises": blocks[bt]}
                for bt in _BLOCK_ORDER
                if bt in blocks
            ]
            sessions.append({"day": day, "blocks": ordered})

        return {
            "weekly_split": [d.model_dump() for d in plan.days],
            "sessions": sessions,
            "conditioning": [],
            "mobility": [],
            "flags": [plan.flag],
        }

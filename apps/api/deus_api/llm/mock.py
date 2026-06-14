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
    "Power":     {"sets": 3, "reps": "3",    "rest": "2 min",  "load_guidance": "RPE 7 — max intent",       "notes": "Full recovery between sets; reset before each rep"},
    "Strength":  {"sets": 4, "reps": "5",    "rest": "2 min",  "load_guidance": "70–75% 1RM (2–3 RIR)",    "notes": "Brace core; stop 2 reps short of failure"},
    "Accessory": {"sets": 3, "reps": "8-12", "rest": "90 sec", "load_guidance": "RPE 6–7",                 "notes": "Controlled tempo; squeeze at peak contraction"},
    "Core":      {"sets": 3, "reps": "10",   "rest": "60 sec", "load_guidance": "Bodyweight",              "notes": "Brace and breathe; maintain neutral spine"},
    "Warmup":    {"sets": 2, "reps": "10",   "rest": "30 sec", "load_guidance": "Technique focus — no load", "notes": "Move through full range; do not rush"},
    "Mobility":  {"sets": 2, "reps": "Hold 30s", "rest": "30 sec", "load_guidance": "Bodyweight",          "notes": "Breathe into the stretch; do not force range"},
}

_BLOCK_ORDER = ["Warmup", "Power", "Strength", "Accessory", "Core", "Mobility"]

_BLOCK_INTENTS = {
    "Warmup":    "Raise tissue temperature and activate primary movers before loading.",
    "Power":     "Train the nervous system for maximal rate of force development.",
    "Strength":  "Build absolute strength in foundational movement patterns.",
    "Accessory": "Reinforce movement quality and address muscular balance.",
    "Core":      "Develop anti-rotation stability and midline resilience.",
    "Mobility":  "Restore joint range of motion and tissue extensibility.",
}


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
            # corrupt one exercise name to exercise the QC/retry path
            program["sessions"][0]["blocks"][0]["exercises"][0]["name"] = "Invented Movement"
        return GenerationResult(parsed=program, raw_text="", stop_reason="end_turn")

    def _pick_for_group(self, group: str, plan: PrecomputedPlan, library: Library):
        """First allowed exercise covering the group; prefer Low CNS so picks
        sit safely on Low-CNS days (jump has only High options — placed on a
        High day when one exists)."""
        allowed = set(plan.allowed_exercise_ids)
        patterns = COVERAGE_GROUPS[group]
        candidates = [
            e for e in library.exercises if e.id in allowed and e.pattern in patterns
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

            # Always include Warmup and Mobility blocks
            blocks_map: dict[str, list] = {
                "Warmup": [],
                "Mobility": [],
            }

            for e in entries:
                block_type = _BLOCK_FOR_PATTERN.get(
                    e.pattern, "Strength" if e.cns == "High" else "Accessory"
                )
                params = _BLOCK_PARAMS[block_type]
                blocks_map.setdefault(block_type, []).append({"name": e.name, **params})

            # Fill Warmup/Mobility with a carry/mobility entry if empty
            if not blocks_map["Warmup"]:
                warmup_entry = next(
                    (e for e in library.exercises if e.pattern in ("carry", "locomotion")
                     and e.id in set(plan.allowed_exercise_ids)), None
                )
                if warmup_entry:
                    blocks_map["Warmup"].append({"name": warmup_entry.name, **_BLOCK_PARAMS["Warmup"]})
                else:
                    # fallback: reuse first entry
                    if entries:
                        blocks_map["Warmup"].append({"name": entries[0].name, **_BLOCK_PARAMS["Warmup"]})

            if not blocks_map["Mobility"]:
                mob_entry = next(
                    (e for e in library.exercises if e.pattern in ("rotation", "hinge", "squat")
                     and e.cns == "Low" and e.id in set(plan.allowed_exercise_ids)), None
                )
                if mob_entry:
                    blocks_map["Mobility"].append({"name": mob_entry.name, **_BLOCK_PARAMS["Mobility"]})
                else:
                    if entries:
                        blocks_map["Mobility"].append({"name": entries[0].name, **_BLOCK_PARAMS["Mobility"]})

            ordered = [
                {
                    "type": bt,
                    "block_intent": _BLOCK_INTENTS[bt],
                    "exercises": blocks_map[bt],
                }
                for bt in _BLOCK_ORDER
                if bt in blocks_map and blocks_map[bt]
            ]
            sessions.append({
                "day": day,
                "session_intent": f"Develop foundational movement quality and strength for {day}.",
                "blocks": ordered,
            })

        split_days = [
            {**d.model_dump(), "estimated_duration_min": 60}
            for d in plan.days
        ]

        flag = plan.flag
        return {
            "program_summary": {
                "week_theme": f"Structured training week — {flag} phase",
                "training_days": len(days),
                "fatigue_state": "high" if flag == "deload" else ("moderate" if flag == "maintain" else "low"),
                "progression_flag": flag,
                "key_focuses": ["Reinforce movement patterns", "Manage fatigue and recovery"],
            },
            "weekly_split": split_days,
            "sessions": sessions,
            "conditioning": [],
            "flags": [flag],
        }

"""Assembles SYSTEM / DEVELOPER / USER content per engine/prompt_wrapper.md.

The DEVELOPER block carries the spec files plus the deterministic
PrecomputedPlan: the fixed weekly split, the per-block loading prescriptions
(goal-driven sets/reps/rest/intent), the allowed exercise pool (already gated
by training level and injury), and the conditioning dose. The LLM's only job
is to choose exercises for the slots — it never sets CNS, volume, or loading.
"""

import json

from ..models.decision import PrecomputedPlan
from ..models.input_contract import GenerateRequest
from .library_loader import Library
from .spec_loader import SpecLoader


def build_developer_block(
    specs: SpecLoader, plan: PrecomputedPlan, library: Library
) -> str:
    allowed = [library.by_id[i].model_dump() for i in plan.allowed_exercise_ids]
    plan_block = {
        "primary_goal": plan.primary_goal,
        "weekly_split": [d.model_dump() for d in plan.days],
        "max_exercises_per_session": plan.volume_budget,
        "required_progression_flag": plan.flag,
        "required_coverage_groups": plan.required_groups,
        "block_prescriptions": {k: v.model_dump() for k, v in plan.prescriptions.items()},
        "conditioning_minutes": plan.conditioning_minutes,
        "allowed_exercises": allowed,
    }
    return (
        specs.developer_text()
        + "\n\n---\n\n### PRECOMPUTED PLAN (MANDATORY — do not deviate)\n\n"
        + "Your weekly_split MUST equal the plan's weekly_split exactly. "
        + "Place sessions only on planned days. Select exercises ONLY from "
        + "allowed_exercises (exact name match). Apply each block's "
        + "prescription (sets/reps/rest/notes) from block_prescriptions. "
        + "flags MUST include the required_progression_flag.\n\n"
        + json.dumps(plan_block, indent=2)
    )


def build_user_block(req: GenerateRequest) -> str:
    return json.dumps(req.model_dump(), indent=2)

"""Assembles SYSTEM / DEVELOPER / USER content per engine/prompt_wrapper.md.

The DEVELOPER block carries the spec files plus the deterministic
PrecomputedPlan, so the LLM's job is reduced to filling exercise slots —
never deciding CNS, volume, coverage, or progression.
"""

import json

from ..models.decision import PrecomputedPlan
from ..models.input_contract import GenerateRequest
from .library_loader import Library
from .spec_loader import SpecLoader


def build_developer_block(
    specs: SpecLoader, plan: PrecomputedPlan, library: Library
) -> str:
    allowed = [
        library.by_id[i].model_dump() for i in plan.allowed_exercise_ids
    ]
    plan_block = {
        "weekly_split": [d.model_dump() for d in plan.days],
        "max_exercises_per_session": plan.volume_budget,
        "required_progression_flag": plan.flag,
        "required_coverage_groups": plan.required_groups,
        "allowed_exercises": allowed,
    }
    return (
        specs.developer_text()
        + "\n\n---\n\n### PRECOMPUTED PLAN (MANDATORY — do not deviate)\n\n"
        + "Your weekly_split MUST equal the plan's weekly_split exactly. "
        + "Sessions only on planned days. Select exercises ONLY from "
        + "allowed_exercises (exact name match). flags MUST include the "
        + "required_progression_flag.\n\n"
        + json.dumps(plan_block, indent=2)
    )


def build_user_block(req: GenerateRequest) -> str:
    return json.dumps(req.model_dump(), indent=2)

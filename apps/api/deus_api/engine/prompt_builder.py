"""Assembles SYSTEM / DEVELOPER / USER content per engine/prompt_wrapper.md.

The DEVELOPER block carries the spec files plus the deterministic
PrecomputedPlan, so the LLM's job is reduced to filling exercise slots —
never deciding CNS, volume, coverage, or progression.
"""

import json

from ..models.assessment import TrainingAssessment
from ..models.athlete_state import AthleteState
from ..models.decision import PrecomputedPlan
from ..models.input_contract import GenerateRequest
from .library_loader import Library
from .spec_loader import SpecLoader
from .variation import avoid_recent_ids


def build_developer_block(
    specs: SpecLoader,
    plan: PrecomputedPlan,
    library: Library,
    assessment: TrainingAssessment | None = None,
    state: AthleteState | None = None,
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
    block = (
        specs.developer_text()
        + "\n\n---\n\n### PRECOMPUTED PLAN (MANDATORY — do not deviate)\n\n"
        + "Your weekly_split MUST equal the plan's weekly_split exactly. "
        + "Sessions only on planned days. Select exercises ONLY from "
        + "allowed_exercises (exact name match, listed novel-first). flags MUST "
        + "include the required_progression_flag.\n\n"
        + json.dumps(plan_block, indent=2)
    )
    if assessment is not None:
        avoid_names: list[str] = []
        if state is not None:
            avoid_names = [
                library.by_id[i].name
                for i in avoid_recent_ids(
                    state, plan.allowed_exercise_ids, assessment.novelty_target
                )
            ][:12]
        directives = {
            "training_state": assessment.training_state,
            "recommended_stimulus": assessment.recommended_stimulus,
            "intensity_target": assessment.intensity_target,
            "intensity_range": assessment.intensity_range,
            "movement_priority": assessment.movement_priority,
            "novelty_target": assessment.novelty_target,
            "avoid_recent_exercises": avoid_names,
        }
        block += (
            "\n\n---\n\n### PROGRAMMING DIRECTIVES (Assessment Layer — guidance)\n\n"
            + "Honour these within the plan: bias selection toward movement_priority "
            + "and the intensity_target; prefer novel exercises and de-prioritise "
            + "avoid_recent_exercises. These NEVER override the precomputed plan or "
            + "the hard safety rules.\n\n"
            + json.dumps(directives, indent=2)
        )
    return block


def build_user_block(req: GenerateRequest) -> str:
    return json.dumps(req.model_dump(), indent=2)

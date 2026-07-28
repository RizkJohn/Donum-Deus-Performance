"""The full generation pipeline (composition root):

validate input → decision engine (deterministic) → prompt assembly →
LLM fill → QC gate → retry (≤3) → Program | UNSATISFIABLE_CONSTRAINTS.
"""

from dataclasses import dataclass, field

from ..llm.base import LLMProvider
from ..models.assessment import TrainingAssessment
from ..models.athlete_state import AthleteState
from ..models.decision import PrecomputedPlan
from ..models.errors import EngineError
from ..models.input_contract import GenerateRequest
from ..models.program import Program
from .assessment import assess
from .athlete_state import load_or_init
from .decision_engine import build_plan
from .library_loader import Library
from .prompt_builder import build_developer_block, build_user_block
from .qc.validator import validate
from .retry import build_retry_feedback
from .spec_loader import SpecLoader, sanitize_for_structured_output


@dataclass
class PipelineResult:
    program: Program | None
    error: EngineError | None
    attempts: int
    plan: PrecomputedPlan | None = None
    qc_history: list[list[str]] = field(default_factory=list)
    assessment: TrainingAssessment | None = None

    @property
    def output(self) -> dict:
        if self.program is not None:
            return self.program.model_dump()
        assert self.error is not None
        return self.error.model_dump()


async def generate_program(
    req: GenerateRequest,
    *,
    provider: LLMProvider,
    specs: SpecLoader,
    library: Library,
    max_attempts: int = 3,
    state: AthleteState | None = None,
    generation_model: str | None = None,
) -> PipelineResult:
    # 0. Athlete state (caller supplies the persisted one; else a fresh init).
    athlete = state if state is not None else load_or_init(None, req)

    # 1. Assessment Layer (deterministic) — abstractions, not workouts.
    assessment = assess(req, athlete, library)

    # 2. Decision engine (constraint-based + variation-aware) — may be unsatisfiable.
    plan = build_plan(req, library, assessment=assessment, state=athlete)
    if isinstance(plan, EngineError):
        return PipelineResult(program=None, error=plan, attempts=0, assessment=assessment)

    # 3. Prompt assembly per prompt_wrapper.md roles (+ programming directives).
    system = specs.system_text()
    developer = build_developer_block(specs, plan, library, assessment=assessment, state=athlete)
    user = build_user_block(req)
    json_schema = sanitize_for_structured_output(specs.output_json_schema())

    # 4. Generate (generation-tier model) → QC → retry loop.
    qc_history: list[list[str]] = []
    feedback = ""
    for attempt in range(1, max_attempts + 1):
        result = await provider.generate(
            system=system,
            developer=developer + (f"\n\n{feedback}" if feedback else ""),
            user=user,
            json_schema=json_schema,
            context={"plan": plan, "library": library, "attempt": attempt},
            model=generation_model,
        )
        if result.refused or result.parsed is None:
            qc_history.append(["provider returned no parseable JSON"
                               + (" (refused)" if result.refused else "")])
            feedback = "PREVIOUS ATTEMPT RETURNED NO VALID JSON. Output JSON only."
            continue

        report = validate(result.parsed, req, plan, library)
        if report.passed and report.program is not None:
            return PipelineResult(
                program=report.program, error=None, attempts=attempt,
                plan=plan, qc_history=qc_history, assessment=assessment,
            )
        qc_history.append(report.reasons)
        feedback = build_retry_feedback(report, attempt)

    # 5. Exhausted: spec failure mode — never a partial plan.
    last = qc_history[-1] if qc_history else ["generation failed"]
    return PipelineResult(
        program=None,
        error=EngineError(reasons=last),
        attempts=max_attempts,
        plan=plan,
        qc_history=qc_history,
        assessment=assessment,
    )

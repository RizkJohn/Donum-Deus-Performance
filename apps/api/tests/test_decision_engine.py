from conftest import make_request
from deus_api.engine.decision_engine import build_plan
from deus_api.models.decision import PrecomputedPlan
from deus_api.models.errors import EngineError
from deus_api.models.input_contract import DAY_ORDER


def _idx(day):
    return DAY_ORDER.index(day)


def test_cns_limits(library):
    plan = build_plan(make_request(training_age="Advanced",
                                   available_days=DAY_ORDER), library)
    assert isinstance(plan, PrecomputedPlan)
    highs = [d.day for d in plan.days if d.cns == "High"]
    assert len(highs) <= 2
    idxs = sorted(_idx(d) for d in highs)
    assert all(b - a > 1 for a, b in zip(idxs, idxs[1:]))


def test_pre_sport_day_is_low(library):
    plan = build_plan(
        make_request(available_days=["Monday", "Wednesday", "Friday", "Saturday"],
                     sport_days={"basketball": ["Tuesday"]}),
        library,
    )
    assert isinstance(plan, PrecomputedPlan)
    monday = next(d for d in plan.days if d.day == "Monday")
    assert monday.cns == "Low"  # day before Tuesday sport


def test_sport_days_excluded_from_training(library):
    plan = build_plan(
        make_request(available_days=["Monday", "Tuesday", "Wednesday"],
                     sport_days={"basketball": ["Tuesday"]}),
        library,
    )
    assert isinstance(plan, PrecomputedPlan)
    assert all(d.day != "Tuesday" for d in plan.days)


def test_no_days_unsatisfiable(library):
    plan = build_plan(
        make_request(available_days=["Monday"], sport_days={"soccer": ["Monday"]}),
        library,
    )
    assert isinstance(plan, EngineError)
    assert plan.error == "UNSATISFIABLE_CONSTRAINTS"
    assert plan.reasons


def test_single_day_beginner_unsatisfiable(library):
    # 1 day x 5-exercise budget < 7 coverage groups
    plan = build_plan(
        make_request(training_age="Beginner", available_days=["Monday"]),
        library,
    )
    assert isinstance(plan, EngineError)


def test_fatigue_reduces_volume_budget(library):
    fresh = build_plan(make_request(fatigue_score=2.0), library)
    tired = build_plan(make_request(fatigue_score=4.5, fatigue_state="high"), library)
    assert isinstance(fresh, PrecomputedPlan) and isinstance(tired, PrecomputedPlan)
    assert tired.volume_budget < fresh.volume_budget
    assert tired.flag == "deload"
    assert fresh.flag == "progress"


def test_injury_pruning_keeps_coverage(library):
    plan = build_plan(make_request(injuries=["knee pain"]), library)
    assert isinstance(plan, PrecomputedPlan)
    # barbell_back_squat lists 'knee' as a contraindication
    assert "barbell_back_squat" in plan.blocked_exercise_ids
    assert "barbell_back_squat" not in plan.allowed_exercise_ids
    # coverage is still satisfiable (knee-safe squat options remain)
    assert "squat" in plan.required_groups


def test_level_gating_for_beginner(library):
    plan = build_plan(make_request(training_age="Beginner"), library)
    assert isinstance(plan, PrecomputedPlan)
    assert plan.allowed_levels == ["Beginner"]
    for ex_id in plan.allowed_exercise_ids:
        assert library.by_id[ex_id].level == "Beginner"


def test_goal_drives_prescription(library):
    strength = build_plan(make_request(primary_goal="Strength"), library)
    hypertrophy = build_plan(make_request(primary_goal="Hypertrophy"), library)
    assert isinstance(strength, PrecomputedPlan)
    assert strength.primary_goal == "Strength"
    assert strength.strength_rep_max <= 6
    assert hypertrophy.primary_goal == "Hypertrophy"
    assert hypertrophy.strength_rep_max > strength.strength_rep_max


def test_fat_loss_adds_conditioning(library):
    plan = build_plan(make_request(primary_goal="Fat Loss"), library)
    assert isinstance(plan, PrecomputedPlan)
    assert plan.conditioning_minutes > 0


def test_short_session_caps_volume(library):
    short = build_plan(make_request(session_duration=30), library)
    long = build_plan(make_request(session_duration=90), library)
    assert isinstance(short, PrecomputedPlan) and isinstance(long, PrecomputedPlan)
    assert short.volume_budget <= long.volume_budget


def test_masters_age_limits_high_cns(library):
    plan = build_plan(
        make_request(age=60, available_days=("Monday", "Wednesday", "Friday", "Saturday")),
        library,
    )
    assert isinstance(plan, PrecomputedPlan)
    assert sum(1 for d in plan.days if d.cns == "High") <= 1

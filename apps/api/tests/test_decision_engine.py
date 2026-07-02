from conftest import make_request
from deus_api.engine.decision_engine import build_plan
from deus_api.models.decision import PrecomputedPlan
from deus_api.models.errors import EngineError
from deus_api.models.input_contract import DAY_ORDER


def _idx(day):
    return DAY_ORDER.index(day)


def test_cns_limits_low_fatigue_allows_three(library):
    # default fatigue (sleep=soreness=energy=stress=2.0) -> score 2.0 -> low -> cap 3
    plan = build_plan(make_request(training_age="Advanced",
                                   available_days=DAY_ORDER), library)
    assert isinstance(plan, PrecomputedPlan)
    assert plan.max_high_cns_days == 3
    highs = [d.day for d in plan.days if d.cns == "High"]
    assert len(highs) <= 3
    idxs = sorted(_idx(d) for d in highs)
    assert all(b - a > 1 for a, b in zip(idxs, idxs[1:]))


def test_cns_limits_moderate_fatigue_caps_at_two(library):
    plan = build_plan(
        make_request(training_age="Advanced", available_days=DAY_ORDER,
                     sleep=3, soreness=3, energy=3, stress=3),
        library,
    )
    assert isinstance(plan, PrecomputedPlan)
    assert plan.max_high_cns_days == 2
    highs = [d.day for d in plan.days if d.cns == "High"]
    assert len(highs) <= 2


def test_cns_limits_high_fatigue_caps_at_one(library):
    plan = build_plan(
        make_request(training_age="Advanced", available_days=DAY_ORDER,
                     sleep=4, soreness=4, energy=4, stress=4),
        library,
    )
    assert isinstance(plan, PrecomputedPlan)
    assert plan.max_high_cns_days == 1
    highs = [d.day for d in plan.days if d.cns == "High"]
    assert len(highs) <= 1


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
    fresh = build_plan(make_request(sleep=2, soreness=2, energy=2, stress=2), library)
    tired = build_plan(make_request(sleep=5, soreness=4, energy=4, stress=5), library)
    assert isinstance(fresh, PrecomputedPlan) and isinstance(tired, PrecomputedPlan)
    assert tired.volume_budget < fresh.volume_budget
    assert tired.flag == "deload"
    assert fresh.flag == "progress"


def test_injury_pruning_keeps_coverage(library):
    plan = build_plan(make_request(injuries=["knee pain"]), library)
    assert isinstance(plan, PrecomputedPlan)
    assert "front_squat" in plan.blocked_exercise_ids
    assert "front_squat" not in plan.allowed_exercise_ids

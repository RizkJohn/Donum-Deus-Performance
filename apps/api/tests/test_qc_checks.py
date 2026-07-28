import pytest

from conftest import make_request
from donum_dei_api.engine.decision_engine import build_plan
from donum_dei_api.engine.qc.validator import validate
from donum_dei_api.llm.mock import MockProvider


@pytest.fixture
def good(library):
    req = make_request()
    plan = build_plan(req, library)
    program = MockProvider()._build_program(plan, library)
    return req, plan, program


def _failed_names(report):
    return {f.name for f in report.failures}


def test_good_program_passes(good, library):
    req, plan, program = good
    report = validate(program, req, plan, library)
    assert report.passed, report.reasons


def test_unknown_exercise_rejected(good, library):
    req, plan, program = good
    program["sessions"][0]["blocks"][0]["exercises"][0]["name"] = "Bicep Blaster"
    report = validate(program, req, plan, library)
    assert "library_only" in _failed_names(report)


def test_amrap_on_strength_rejected(good, library):
    req, plan, program = good
    for session in program["sessions"]:
        for block in session["blocks"]:
            if block["type"] in ("Strength", "Power"):
                block["exercises"][0]["reps"] = "AMRAP"
                report = validate(program, req, plan, library)
                assert "intensity_safety" in _failed_names(report)
                return
    pytest.skip("no strength/power block in fixture")


def test_three_high_days_rejected(good, library):
    req, plan, program = good
    for d in program["weekly_split"]:
        d["cns"] = "High"
    report = validate(program, req, plan, library)
    assert "cns_limits" in _failed_names(report)


def test_volume_cap_rejected(good, library):
    req, plan, program = good
    block = program["sessions"][0]["blocks"][0]
    ex = block["exercises"][0]
    block["exercises"] = [dict(ex) for _ in range(9)]
    report = validate(program, req, plan, library)
    assert "volume_ok" in _failed_names(report)


def test_block_order_rejected(good, library):
    req, plan, program = good
    session = next(s for s in program["sessions"] if len(s["blocks"]) >= 2)
    session["blocks"].reverse()
    report = validate(program, req, plan, library)
    assert "block_order" in _failed_names(report)


def test_missing_flag_rejected(good, library):
    req, plan, program = good
    program["flags"] = []
    report = validate(program, req, plan, library)
    assert "progression_flag" in _failed_names(report)


def test_schema_violation_rejected(good, library):
    req, plan, program = good
    program["sessions"][0]["blocks"][0]["exercises"][0]["sets"] = 12
    report = validate(program, req, plan, library)
    assert _failed_names(report) == {"schema_valid"}


def test_split_deviation_rejected(good, library):
    req, plan, program = good
    program["weekly_split"] = program["weekly_split"][:-1]
    report = validate(program, req, plan, library)
    assert "plan_adherence" in _failed_names(report)

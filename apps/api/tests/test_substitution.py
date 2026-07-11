from donum_dei_api.engine.substitution import blocked_ids_for_injuries, resolve_substitute


def test_substitute_preserves_pattern_and_cns(library):
    sub_id = resolve_substitute(library, "trap_bar_deadlift", blocked=set())
    assert sub_id == "barbell_deadlift"
    primary, sub = library.by_id["trap_bar_deadlift"], library.by_id[sub_id]
    assert sub.pattern == primary.pattern
    assert sub.cns == primary.cns


def test_substitute_skips_blocked(library):
    assert resolve_substitute(
        library, "trap_bar_deadlift", blocked={"barbell_deadlift"}
    ) is None


def test_injury_keyword_matching():
    blocked = blocked_ids_for_injuries(["left shoulder impingement"])
    assert "pullups" in blocked and "arnold_press" in blocked
    assert blocked_ids_for_injuries([]) == set()


def test_all_substitution_rules_valid(library):
    """Every canonical substitution pair preserves pattern + cns (spec rule)."""
    for rule in library.rules:
        primary = library.by_id[rule.primary_id]
        for alt_id in rule.alternatives:
            alt = library.by_id[alt_id]
            assert alt.pattern == primary.pattern, f"{rule.primary_id}->{alt_id}"
            assert alt.cns == primary.cns, f"{rule.primary_id}->{alt_id}"

from deus_api.engine.injuries import blocked_ids_for_injuries, normalize_injuries
from deus_api.engine.substitution import resolve_substitute


def test_substitute_preserves_pattern_and_cns(library):
    sub_id = resolve_substitute(library, "barbell_back_squat", blocked=set())
    assert sub_id is not None
    primary, sub = library.by_id["barbell_back_squat"], library.by_id[sub_id]
    assert sub.pattern == primary.pattern
    assert sub.cns == primary.cns


def test_substitute_skips_blocked(library):
    # block all listed alternatives -> no substitute
    alts = set(library.subs_by_primary.get("barbell_back_squat", []))
    assert resolve_substitute(library, "barbell_back_squat", blocked=alts) is None


def test_substitute_respects_level(library):
    # a Beginner client cannot receive an Advanced substitute
    sub = resolve_substitute(
        library, "goblet_squat", blocked=set(), allowed_levels={"Beginner"}
    )
    if sub is not None:
        assert library.by_id[sub].level == "Beginner"


def test_injury_normalization():
    tags = normalize_injuries(["left shoulder impingement", "Lower Back"])
    assert tags == {"shoulder", "lower_back"}
    assert normalize_injuries([]) == set()
    assert normalize_injuries(["None"]) == set()


def test_injury_blocks_are_data_driven(library):
    blocked = blocked_ids_for_injuries(library, ["knee"])
    # every blocked exercise actually lists the knee contraindication
    assert blocked
    for ex_id in blocked:
        assert "knee" in library.by_id[ex_id].contraindications
    # and an exercise without that tag is not blocked
    assert blocked_ids_for_injuries(library, []) == set()


def test_all_substitution_rules_valid(library):
    """Every canonical substitution pair preserves pattern + cns (spec rule)."""
    for rule in library.rules:
        primary = library.by_id[rule.primary_id]
        for alt_id in rule.alternatives:
            alt = library.by_id[alt_id]
            assert alt.pattern == primary.pattern, f"{rule.primary_id}->{alt_id}"
            assert alt.cns == primary.cns, f"{rule.primary_id}->{alt_id}"


def test_library_is_extensive(library):
    assert len(library.exercises) >= 80
    patterns = {e.pattern for e in library.exercises}
    assert patterns == {
        "squat", "hinge", "push_h", "push_v", "pull_h", "pull_v",
        "rotation", "anti_rotation", "carry", "locomotion", "jump",
    }
    # every exercise carries the enriched metadata
    for e in library.exercises:
        assert e.equipment and e.muscles and e.level

"""engine/substitution_rules.md — injury/equipment substitution resolver.

Rules: keep same pattern and cns; prefer same laterality; if no valid
substitute exists → UNSATISFIABLE_CONSTRAINTS (handled by the decision
engine when a coverage group empties).
"""

from .library_loader import Library

# Injury keyword → blocked exercise ids. Matched case-insensitively as a
# substring of each reported injury string. Deliberately conservative maps
# chosen so weekly movement coverage stays satisfiable via substitutions.
INJURY_BLOCKS: dict[str, list[str]] = {
    "shoulder": ["pullups", "arnold_press", "incline_db_press", "med_ball_slam"],
    "knee": ["front_squat", "back_squat", "broad_jump", "bulgarian_split_squat"],
    "back": ["barbell_deadlift", "trap_bar_deadlift", "jefferson_curl", "db_swings", "med_ball_slam"],
    "wrist": ["pushups", "bear_crawl"],
    "ankle": ["broad_jump"],
}


def blocked_ids_for_injuries(injuries: list[str]) -> set[str]:
    blocked: set[str] = set()
    for injury in injuries:
        needle = injury.lower()
        for keyword, ids in INJURY_BLOCKS.items():
            if keyword in needle:
                blocked.update(ids)
    return blocked


def resolve_substitute(
    library: Library, primary_id: str, blocked: set[str]
) -> str | None:
    """Return the first valid substitute for a blocked exercise, or None.

    A valid substitute preserves pattern and cns; same laterality preferred.
    """
    primary = library.by_id.get(primary_id)
    if primary is None:
        return None
    candidates = []
    for alt_id in library.subs_by_primary.get(primary_id, []):
        alt = library.by_id.get(alt_id)
        if alt is None or alt_id in blocked:
            continue
        if alt.pattern != primary.pattern or alt.cns != primary.cns:
            continue
        candidates.append(alt)
    if not candidates:
        return None
    same_lat = [a for a in candidates if a.laterality == primary.laterality]
    return (same_lat or candidates)[0].id

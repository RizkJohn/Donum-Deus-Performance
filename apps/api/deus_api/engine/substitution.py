"""Equipment/injury substitution resolver (engine/substitution_rules.md).

Swaps a removed exercise for an alternative that preserves movement pattern
and CNS demand, prefers the same laterality, stays within the client's
training level, and isn't itself blocked. Returns None when no valid
substitute exists (the caller surfaces UNSATISFIABLE_CONSTRAINTS).
"""

from .library_loader import Library


def resolve_substitute(
    library: Library,
    primary_id: str,
    blocked: set[str],
    allowed_levels: set[str] | None = None,
) -> str | None:
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
        if allowed_levels is not None and alt.level not in allowed_levels:
            continue
        candidates.append(alt)
    if not candidates:
        return None
    same_lat = [a for a in candidates if a.laterality == primary.laterality]
    return (same_lat or candidates)[0].id

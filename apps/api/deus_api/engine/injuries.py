"""Normalize free-text assessment injury labels to canonical contraindication
tags, and resolve which library exercises a client's injuries remove.

The assessment funnel offers: Shoulder, Knee, Lower Back, Wrist, Ankle (+ None).
Contraindications live on each exercise in the library (data-driven), so adding
an exercise or refining its risk profile is a markdown edit, not a code change.
"""

from .library_loader import Library

# substring (lowercased) -> canonical tag
_INJURY_ALIASES: dict[str, str] = {
    "shoulder": "shoulder",
    "rotator": "shoulder",
    "knee": "knee",
    "patell": "knee",
    "lower back": "lower_back",
    "low back": "lower_back",
    "lumbar": "lower_back",
    "back": "lower_back",
    "wrist": "wrist",
    "elbow": "elbow",
    "ankle": "ankle",
    "hip": "hip",
    "neck": "neck",
    "cervical": "neck",
}


def normalize_injuries(injuries: list[str]) -> set[str]:
    tags: set[str] = set()
    for injury in injuries:
        needle = injury.lower()
        for alias, tag in _INJURY_ALIASES.items():
            if alias in needle:
                tags.add(tag)
    return tags


def blocked_ids_for_injuries(library: Library, injuries: list[str]) -> set[str]:
    tags = normalize_injuries(injuries)
    if not tags:
        return set()
    return {
        e.id for e in library.exercises
        if tags & set(e.contraindications)
    }

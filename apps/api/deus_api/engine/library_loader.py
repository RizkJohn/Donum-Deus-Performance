"""Loads the derived exercise library + substitution rules JSON and builds
lookup indices used by the decision engine, substitution resolver, and QC."""

import json
from functools import lru_cache
from pathlib import Path

from ..models.library import ExerciseEntry, SubstitutionRule


class Library:
    def __init__(self, exercises: list[ExerciseEntry], rules: list[SubstitutionRule]):
        self.exercises = exercises
        self.rules = rules
        self.by_id: dict[str, ExerciseEntry] = {e.id: e for e in exercises}
        self.by_name: dict[str, ExerciseEntry] = {e.name: e for e in exercises}
        self.name_set: set[str] = set(self.by_name)
        self.by_pattern: dict[str, list[ExerciseEntry]] = {}
        for e in exercises:
            self.by_pattern.setdefault(e.pattern, []).append(e)
        self.subs_by_primary: dict[str, list[str]] = {
            r.primary_id: r.alternatives for r in rules
        }


@lru_cache
def get_library(data_dir: Path) -> Library:
    exercises = [
        ExerciseEntry.model_validate(e)
        for e in json.loads((data_dir / "exercise_library.json").read_text())
    ]
    rules = [
        SubstitutionRule.model_validate(r)
        for r in json.loads((data_dir / "substitution_rules.json").read_text())
    ]
    return Library(exercises, rules)

#!/usr/bin/env python3
"""Generate derived JSON artifacts from the canonical engine markdown specs.

The markdown in engine/ is the SOURCE OF TRUTH. This script ports the
structured data — exercise library and substitution rules — to JSON that the
deterministic decision engine, QC gate, and substitution resolver consume.
Never hand-edit the JSON; re-run `make seed-library` after editing the
markdown. tests/test_library_sync.py fails CI if the committed JSON drifts.

Library entry format (one block per exercise under `## LIBRARY`):

    - id: barbell_back_squat
      name: Barbell Back Squat
      pattern: squat
      cns: High
      laterality: Bilateral
      level: Intermediate
      equipment: [barbell]
      muscles: [quadriceps, glutes, erectors]
      contraindications: [knee, lower_back]

`contraindications` may be omitted or `[]`. Field order is fixed.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

API_ROOT = Path(__file__).resolve().parent.parent
REPO_ROOT = API_ROOT.parent.parent
ENGINE_DIR = REPO_ROOT / "engine"
DATA_DIR = API_ROOT / "data"

# Validate against the Pydantic schema (single source of field truth).
sys.path.insert(0, str(API_ROOT))
from deus_api.models.library import ExerciseEntry, SubstitutionRule  # noqa: E402

ENTRY_RE = re.compile(
    r"- id:\s*(?P<id>[a-z][a-z0-9_]*)\s*\n"
    r"\s+name:\s*(?P<name>.+?)\s*\n"
    r"\s+pattern:\s*(?P<pattern>[a-z_]+)\s*\n"
    r"\s+cns:\s*(?P<cns>High|Low)\s*\n"
    r"\s+laterality:\s*(?P<laterality>Unilateral|Bilateral)\s*\n"
    r"\s+level:\s*(?P<level>Beginner|Intermediate|Advanced)\s*\n"
    r"\s+equipment:\s*\[(?P<equipment>[^\]]*)\]\s*\n"
    r"\s+muscles:\s*\[(?P<muscles>[^\]]*)\]"
    r"(?:\s*\n\s+contraindications:\s*\[(?P<contra>[^\]]*)\])?",
)

SUB_RE = re.compile(r"^(?P<primary>[a-z][a-z0-9_]*) -> \[(?P<alts>[^\]]*)\]\s*$")


def _list(raw: str | None) -> list[str]:
    if not raw:
        return []
    return [item.strip() for item in raw.split(",") if item.strip()]


def parse_exercise_library(text: str) -> list[dict]:
    section = text.split("## LIBRARY", 1)
    if len(section) != 2:
        raise SystemExit("exercise_library.md: missing '## LIBRARY' section")
    entries: list[dict] = []
    for m in ENTRY_RE.finditer(section[1]):
        entry = {
            "id": m.group("id"),
            "name": m.group("name").strip(),
            "pattern": m.group("pattern"),
            "cns": m.group("cns"),
            "laterality": m.group("laterality"),
            "level": m.group("level"),
            "equipment": _list(m.group("equipment")),
            "muscles": _list(m.group("muscles")),
            "contraindications": _list(m.group("contra")),
        }
        ExerciseEntry.model_validate(entry)  # raises on any schema violation
        entries.append(entry)
    if not entries:
        raise SystemExit("exercise_library.md: no entries parsed")
    ids = [e["id"] for e in entries]
    if len(ids) != len(set(ids)):
        dupes = {i for i in ids if ids.count(i) > 1}
        raise SystemExit(f"exercise_library.md: duplicate ids: {dupes}")
    return entries


def parse_substitution_rules(text: str, valid_ids: set[str]) -> list[dict]:
    sections = text.split("## SUBSTITUTIONS", 1)
    if len(sections) != 2:
        raise SystemExit("substitution_rules.md: missing '## SUBSTITUTIONS' section")
    rules: list[dict] = []
    for line in sections[1].splitlines():
        m = SUB_RE.match(line.strip())
        if not m:
            continue
        primary = m.group("primary")
        alts = _list(m.group("alts"))
        for ref in [primary, *alts]:
            if ref not in valid_ids:
                raise SystemExit(
                    f"substitution_rules.md references unknown exercise id: {ref}"
                )
        rule = {"primary_id": primary, "alternatives": alts}
        SubstitutionRule.model_validate(rule)
        rules.append(rule)
    if not rules:
        raise SystemExit("substitution_rules.md: no rules parsed")
    return rules


def main() -> int:
    library = parse_exercise_library((ENGINE_DIR / "exercise_library.md").read_text())
    rules = parse_substitution_rules(
        (ENGINE_DIR / "substitution_rules.md").read_text(),
        {e["id"] for e in library},
    )
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    (DATA_DIR / "exercise_library.json").write_text(json.dumps(library, indent=2) + "\n")
    (DATA_DIR / "substitution_rules.json").write_text(json.dumps(rules, indent=2) + "\n")
    print(f"wrote {len(library)} exercises, {len(rules)} substitution rules")
    return 0


if __name__ == "__main__":
    sys.exit(main())

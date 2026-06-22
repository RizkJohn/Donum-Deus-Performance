#!/usr/bin/env python3
"""Generate derived JSON artifacts from the canonical engine markdown specs.

The markdown in packages/engine/ is the SOURCE OF TRUTH (lowercase files, per
CLAUDE.md). This script ports the structured data — exercise library and
substitution rules — to JSON that deterministic code consumes. Never
hand-edit the JSON; re-run `make seed-library` after editing the markdown.
tests/test_library_sync.py fails CI if the committed JSON drifts.

Usage: python scripts/port_library.py
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

API_ROOT = Path(__file__).resolve().parent.parent
REPO_ROOT = API_ROOT.parent.parent
ENGINE_DIR = REPO_ROOT / "packages" / "engine"
DATA_DIR = API_ROOT / "data"

ENTRY_RE = re.compile(
    r"- id: (?P<id>[a-z][a-z0-9_]*)\s*\n"
    r"\s+name: (?P<name>.+?)\s*\n"
    r"\s+pattern: (?P<pattern>[a-z_]+)\s*\n"
    r"\s+cns: (?P<cns>High|Low)\s*\n"
    r"\s+laterality: (?P<laterality>Unilateral|Bilateral)",
)

SUB_RE = re.compile(r"^(?P<primary>[a-z][a-z0-9_]*) -> \[(?P<alts>[^\]]*)\]\s*$")


def parse_exercise_library(text: str) -> list[dict]:
    # Only parse the canonical LIBRARY section (skip the FORMAT example block).
    library_section = text.split("## LIBRARY", 1)
    if len(library_section) != 2:
        raise SystemExit("exercise_library.md: missing '## LIBRARY' section")
    entries = [m.groupdict() for m in ENTRY_RE.finditer(library_section[1])]
    if not entries:
        raise SystemExit("exercise_library.md: no entries parsed")
    ids = [e["id"] for e in entries]
    if len(ids) != len(set(ids)):
        raise SystemExit("exercise_library.md: duplicate ids")
    return entries


def parse_substitution_rules(text: str, valid_ids: set[str]) -> list[dict]:
    sections = text.split("## SUBSTITUTIONS", 1)
    if len(sections) != 2:
        raise SystemExit("substitution_rules.md: missing '## SUBSTITUTIONS' section")
    rules = []
    for line in sections[1].splitlines():
        m = SUB_RE.match(line.strip())
        if not m:
            continue
        primary = m.group("primary")
        alts = [a.strip() for a in m.group("alts").split(",") if a.strip()]
        for ref in [primary, *alts]:
            if ref not in valid_ids:
                raise SystemExit(
                    f"substitution_rules.md references unknown exercise id: {ref}"
                )
        rules.append({"primary_id": primary, "alternatives": alts})
    if not rules:
        raise SystemExit("substitution_rules.md: no rules parsed")
    return rules


def main() -> int:
    library = parse_exercise_library(
        (ENGINE_DIR / "exercise_library.md").read_text()
    )
    rules = parse_substitution_rules(
        (ENGINE_DIR / "substitution_rules.md").read_text(),
        {e["id"] for e in library},
    )
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    (DATA_DIR / "exercise_library.json").write_text(
        json.dumps(library, indent=2) + "\n"
    )
    (DATA_DIR / "substitution_rules.json").write_text(
        json.dumps(rules, indent=2) + "\n"
    )
    print(f"wrote {len(library)} exercises, {len(rules)} substitution rules")
    return 0


if __name__ == "__main__":
    sys.exit(main())

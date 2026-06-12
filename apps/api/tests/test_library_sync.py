"""Guards the markdown→JSON port: the committed data/*.json must match what
scripts/port_library.py produces from the canonical engine/*.md. Fails when
someone edits the markdown without regenerating (make seed-library) or
hand-edits the derived JSON."""

import json
import sys
from pathlib import Path

API_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(API_ROOT / "scripts"))

import port_library  # noqa: E402


def test_exercise_library_in_sync():
    parsed = port_library.parse_exercise_library(
        (port_library.ENGINE_DIR / "exercise_library.md").read_text()
    )
    committed = json.loads(
        (port_library.DATA_DIR / "exercise_library.json").read_text()
    )
    assert parsed == committed, "run `make seed-library` after editing the markdown"


def test_substitution_rules_in_sync():
    library = port_library.parse_exercise_library(
        (port_library.ENGINE_DIR / "exercise_library.md").read_text()
    )
    parsed = port_library.parse_substitution_rules(
        (port_library.ENGINE_DIR / "substitution_rules.md").read_text(),
        {e["id"] for e in library},
    )
    committed = json.loads(
        (port_library.DATA_DIR / "substitution_rules.json").read_text()
    )
    assert parsed == committed, "run `make seed-library` after editing the markdown"

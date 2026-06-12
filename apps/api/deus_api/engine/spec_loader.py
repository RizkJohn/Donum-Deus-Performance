"""Loads the canonical engine markdown specs as prompt text.

Per engine/prompt_wrapper.md:
  SYSTEM    = engine_instructions
  DEVELOPER = output_schema + exercise_library + substitution_rules +
              progression_engine + fatigue_model + quality_control
  USER      = input payload

Only the lowercase spec files are loaded — they are the source of truth
(CLAUDE.md); the UPPERCASE companions are narrative and ignored by code.
"""

import json
from functools import lru_cache
from pathlib import Path

SYSTEM_SPEC = "engine_instructions.md"
DEVELOPER_SPECS = [
    "output_schema.md",
    "exercise_library.md",
    "substitution_rules.md",
    "progression_engine.md",
    "fatigue_model.md",
    "quality_control.md",
]


class SpecLoader:
    def __init__(self, spec_dir: Path):
        self.spec_dir = spec_dir

    def _read(self, name: str) -> str:
        return (self.spec_dir / name).read_text()

    def system_text(self) -> str:
        return self._read(SYSTEM_SPEC)

    def developer_text(self) -> str:
        parts = []
        for name in DEVELOPER_SPECS:
            parts.append(f"### {name}\n\n{self._read(name)}")
        return "\n\n---\n\n".join(parts)

    def output_json_schema(self) -> dict:
        """The enforced JSON Schema embedded in output_schema.md."""
        text = self._read("output_schema.md")
        return json.loads(text[text.index("{"):])


def sanitize_for_structured_output(schema: dict) -> dict:
    """Strip constraints unsupported by LLM structured-output enforcement
    (pattern / maxLength / minLength). The full schema is re-validated
    structurally by Pydantic in the QC gate regardless."""
    if isinstance(schema, dict):
        return {
            k: sanitize_for_structured_output(v)
            for k, v in schema.items()
            if k not in ("pattern", "maxLength", "minLength")
        }
    if isinstance(schema, list):
        return [sanitize_for_structured_output(v) for v in schema]
    return schema


@lru_cache
def get_spec_loader(spec_dir: Path) -> SpecLoader:
    return SpecLoader(spec_dir)

"""Spec failure mode: {"error":"UNSATISFIABLE_CONSTRAINTS","reasons":[...]}
JSON only — never a partial plan."""

from typing import Literal

from pydantic import BaseModel, ConfigDict


class EngineError(BaseModel):
    model_config = ConfigDict(extra="forbid")
    error: Literal["UNSATISFIABLE_CONSTRAINTS"] = "UNSATISFIABLE_CONSTRAINTS"
    reasons: list[str]

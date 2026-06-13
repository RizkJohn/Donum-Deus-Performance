"""Goal-driven programming parameters (NASM / ACSM / NSCA aligned).

The decision engine resolves the client's primary goal into concrete per-block
prescriptions — sets, rep ranges, rest, and intent — plus a volume bias and a
conditioning dose. These are deterministic and injected into the plan; the LLM
fills exercises into the slots but never sets the loading scheme.

References: NSCA Essentials of S&C (3e) loading continuum, ACSM resistance
training guidelines, NASM OPT model.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class BlockRx:
    sets: int          # output schema: 1..6
    reps: str          # output schema: "n" | "lo-hi" | "AMRAP"
    rest: str          # output schema: "n sec" | "n min"
    notes: str


@dataclass(frozen=True)
class GoalProfile:
    key: str
    label: str
    power: BlockRx
    strength: BlockRx
    accessory: BlockRx
    core: BlockRx
    conditioning_minutes: int   # 0 = omit conditioning
    volume_bias: float          # scales the base per-session exercise budget
    # Allowed numeric rep band for primary (Strength) blocks — QC enforces it.
    strength_rep_min: int
    strength_rep_max: int


# Canonical goal profiles. Reps stay within the output schema regex.
GOAL_PROFILES: dict[str, GoalProfile] = {
    "strength": GoalProfile(
        key="strength", label="Strength",
        power=BlockRx(4, "3", "3 min", "Maximal intent, full recovery"),
        strength=BlockRx(4, "3-5", "3 min", "85%+ 1RM, 1-2 RIR, explosive concentric"),
        accessory=BlockRx(3, "6-8", "2 min", "Controlled, 1-2 RIR"),
        core=BlockRx(3, "8-10", "60 sec", "Braced, anti-movement"),
        conditioning_minutes=0, volume_bias=0.9,
        strength_rep_min=2, strength_rep_max=6,
    ),
    "hypertrophy": GoalProfile(
        key="hypertrophy", label="Hypertrophy",
        power=BlockRx(3, "3", "2 min", "Max intent, primer for heavy work"),
        strength=BlockRx(4, "6-8", "2 min", "1-2 RIR, full range of motion"),
        accessory=BlockRx(3, "10-12", "75 sec", "1 RIR, controlled tempo"),
        core=BlockRx(3, "12-15", "45 sec", "Time under tension"),
        conditioning_minutes=5, volume_bias=1.2,
        strength_rep_min=5, strength_rep_max=12,
    ),
    "fat_loss": GoalProfile(
        key="fat_loss", label="Fat Loss",
        power=BlockRx(3, "3", "2 min", "Max intent, keep CNS sharp"),
        strength=BlockRx(3, "8-12", "75 sec", "Retain muscle, 1-2 RIR"),
        accessory=BlockRx(3, "12-15", "45 sec", "Short rest, elevated heart rate"),
        core=BlockRx(3, "12-15", "30 sec", "Continuous, minimal rest"),
        conditioning_minutes=15, volume_bias=1.1,
        strength_rep_min=6, strength_rep_max=15,
    ),
    "athletic": GoalProfile(
        key="athletic", label="Athletic Performance",
        power=BlockRx(4, "3", "2 min", "Maximal velocity / intent"),
        strength=BlockRx(4, "4-6", "2.5 min", "Heavy with explosive intent, 1-2 RIR"),
        accessory=BlockRx(3, "8-10", "90 sec", "Unilateral bias, control landing"),
        core=BlockRx(3, "8-10", "45 sec", "Rotary power and bracing"),
        conditioning_minutes=10, volume_bias=1.0,
        strength_rep_min=3, strength_rep_max=6,
    ),
    "general": GoalProfile(
        key="general", label="General Health",
        power=BlockRx(3, "3", "2 min", "Submaximal, learn explosive intent"),
        strength=BlockRx(3, "8-10", "90 sec", "Leave 2-3 RIR, prioritize quality"),
        accessory=BlockRx(2, "10-12", "60 sec", "Comfortable, full range of motion"),
        core=BlockRx(2, "10-12", "45 sec", "Bracing and control"),
        conditioning_minutes=10, volume_bias=1.0,
        strength_rep_min=6, strength_rep_max=12,
    ),
}

# Map the assessment's primary-goal labels onto canonical profiles.
_GOAL_ALIASES: dict[str, str] = {
    "strength": "strength",
    "hypertrophy": "hypertrophy",
    "muscle": "hypertrophy",
    "size": "hypertrophy",
    "fat loss": "fat_loss",
    "fat": "fat_loss",
    "weight loss": "fat_loss",
    "recomp": "fat_loss",
    "athletic": "athletic",
    "performance": "athletic",
    "sport": "athletic",
    "power": "athletic",
    "general": "general",
    "health": "general",
    "wellness": "general",
    "fitness": "general",
}


def resolve_goal(primary_goal: str) -> GoalProfile:
    """Normalize a free-text primary goal to a canonical GoalProfile.
    Falls back to General Health when nothing matches."""
    needle = primary_goal.strip().lower()
    for alias, key in _GOAL_ALIASES.items():
        if alias in needle:
            return GOAL_PROFILES[key]
    return GOAL_PROFILES["general"]

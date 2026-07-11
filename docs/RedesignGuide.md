# Redesign Guide

Use a tiered architecture, not a single-model architecture.

For a performance coaching app where the assessment engine must:

- infer training readiness
- adapt programming logic dynamically
- avoid repetitive outputs
- maintain longitudinal coherence
- reason over incomplete human inputs
- preserve constraints/injury history/fatigue patterns
- generate novel but valid programming variations

…the highest leverage setup is:

| Function | Recommended Claude Model | Why |
| --- | --- | --- |
| Core assessment + reasoning engine | Claude Opus 4.8 | Best deep reasoning, abstraction, longitudinal planning, nuanced adaptation |
| High-volume day-to-day program generation | Claude Sonnet 4.6 | Much cheaper/faster while retaining strong reasoning |
| Lightweight UI interactions/chat | Claude Haiku 4.5 | Cost-efficient conversational layer |

> Implementation note: these tiers are wired in `apps/api/donum_dei_api/config.py`
> (`assessment_model` / `generation_model` / `chat_model`). The Assessment
> Layer is deterministic by default, so the Opus tier only bills when
> `LLM_PROVIDER=claude`. The mock provider runs the whole pipeline offline.

# **Critical Point**

The model matters less than the architecture.

Most “stagnant” coaching systems fail because:

- they use static prompt templates
- no persistent athlete state model exists
- progression logic is deterministic
- there’s no fatigue/recovery abstraction
- exercise selection lacks semantic categorization
- no variation engine exists
- they regenerate from scratch each session

That creates repetitive outputs regardless of model quality.

# **Recommended Architecture**

**1. Persistent Athlete State Engine (Most Important)**

Do not ask Claude to “remember” implicitly.

Maintain structured state externally:

{

"training_age": 6,

"goal_priority": ["hypertrophy", "conditioning"],

"movement_restrictions": ["left shoulder impingement"],

"fatigue_index": 0.72,

"recovery_capacity": "moderate",

"exercise_aversion": ["barbell lunges"],

"preferred_modalities": ["dumbbells", "sled"],

"recent_movement_patterns": {

"horizontal_push": 8,

"hinge": 5,

"unilateral_knee": 2

},

"novelty_tolerance": "medium",

"compliance_score": 0.81

}

Claude should reason *against* a structured state object.

This is the biggest upgrade you can make.

# **2. Use Opus for Assessment Logic Only**

Use Opus for:

- intake interpretation
- progression decisions
- plateau analysis
- recovery analysis
- autoregulation
- adaptive mesocycle planning
- constraint resolution
- movement substitution logic

Do NOT waste Opus generating every workout.

Instead:

**Workflow**

User Input

↓

State Update Engine

↓

Opus determines:

- training phase
- fatigue status
- progression direction
- movement priorities
- novelty requirements
- constraints

↓

Compressed programming directives

↓

Sonnet generates sessions

This reduces cost massively while improving consistency.

# **3. Build a “Variation Engine”**

This is the real anti-repetition mechanism.

Claude alone will eventually converge stylistically.

You need:

- exercise ontology
- movement taxonomy
- novelty scoring
- exposure tracking

Example:

{

"movement_pattern": "horizontal_push",

"stimulus": "hypertrophy",

"equipment": "dumbbell",

"stability_demand": "moderate",

"fatigue_cost": 0.42,

"novelty_score": 0.67

}

Then rotate:

- tempo
- implements
- loading profile
- unilateral/bilateral bias
- sequencing
- density
- set structure
- rep targets
- metabolic emphasis

without violating progression continuity.

Most AI coaching apps fail here because they confuse “randomness” with “adaptation.”

# **4. Separate “Assessment” From “Programming”**

Do not let one prompt do both.

**Assessment Layer**

Produces:

- readiness score
- adaptation trend
- recovery classification
- overload tolerance
- recommended intensity range
- progression path
- exercise exclusions

**Programming Layer**

Consumes assessment outputs.

This modularity dramatically improves adaptability.

# **5. Use Constraint-Based Generation**

Instead of:

“Generate a workout.”

Use:

{

"required_patterns": [

"hinge",

"horizontal_push",

"carry"

],

"fatigue_ceiling": 0.68,

"session_duration": 55,

"novelty_target": 0.35,

"avoid_recent_exercises": true,

"intensity_target": "moderate-high"

}

Claude performs much better under constrained generation than open-ended generation.

# **6. Add Reinforcement Signals**

Track:

- completion %
- RPE drift
- soreness
- skipped exercises
- substitutions
- enjoyment
- performance trends

Then feed that back into assessment.

Otherwise adaptation remains superficial.

# **Recommended Model Decision**

**Best Overall**

Use:

- Opus 4.8 for assessment/reasoning
- Sonnet 4.6 for session generation

This is likely optimal for:

- intelligence
- scalability
- cost efficiency
- adaptive fidelity

# **When Sonnet Alone Is Enough**

Use only Sonnet 4.6 if:

- <10k active users
- simpler progression systems
- lower complexity athlete populations
- fewer injury constraints
- lower memory depth

Sonnet is already substantially stronger than most production coaching engines.

# **When Opus Becomes Necessary**

Use Opus if you need:

- advanced autoregulation
- elite athlete nuance
- long-horizon periodization
- complex injury management
- psychological adherence modeling
- dynamic phase transitions
- nonlinear progression reasoning

That is where Opus materially separates itself.

# **Most Important Technical Insight**

The assessment engine should output:

- abstractions
- constraints
- priorities
- probabilities

—not workouts.

Example:

{

"training_state": "functional_overreach",

"recommended_stimulus": "volume reduction",

"movement_priority": "posterior_chain",

"novelty_requirement": 0.42,

"max_systemic_fatigue": 0.61

}

Then another layer generates programming.

That separation is what creates genuinely adaptive systems instead of repetitive AI templates.
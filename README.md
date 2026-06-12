# Deus Performance
*by Riz Management LLC*

> *Deus — the body is a gift. Train it accordingly.*

---

## Repository Structure

```
deus-performance/
├── engine/              # Core training system brain
│   ├── engine_instructions.md      # System rules & CNS management
│   ├── exercise_library.md         # Approved exercise pool
│   ├── fatigue_model.md            # Fatigue scoring & accumulation rules
│   ├── input_contract.md           # Client payload schema
│   ├── output_schema.md            # Program output format
│   ├── progression_engine.md       # Load/volume progression logic
│   ├── quality_control.md          # QC checklist (pre-output gate)
│   ├── substitution_rules.md       # Exercise substitution logic
│   ├── retry_policy.md             # Error handling & retry behavior
│   ├── prompt_wrapper.md           # API prompt wrapping instructions
│   └── ARCHITECTURE_SUMMARY.md    # High-level system architecture
│
├── frontend/            # Client-facing web interfaces
│   ├── deus_v1.html                # Initial landing page / engine interface
│   └── deus_v2.html                # Redesigned DP site (current)
│
├── business/            # Business strategy & planning
│   └── DDHoldings_Business_Plan.md # Full blueprint, projections, brand system
│
├── docs/                # Reference documentation
│   ├── RedesignGuide.md            # Frontend redesign specifications
│   └── io-vs-com-org-guide.md      # Domain strategy guide
│
└── README.md
```

---

## System Overview

Deus Performance (DP) is a **constraint-driven adaptive training engine** operating under a fixed objective hierarchy:

1. Joint Integrity
2. Movement Quality
3. Strength
4. Work Capacity
5. Hypertrophy
6. Sport / Skill Performance

The engine takes a structured client payload and returns a complete weekly training program conforming to CNS management rules, movement pattern coverage requirements, and fatigue accumulation constraints.

---

## Engine Architecture

**Input** → `input_contract.md`  
Client profile, goals, schedule, fatigue state, injuries

**Processing** → `engine_instructions.md` + `fatigue_model.md` + `progression_engine.md`  
CNS classification, session design, movement pattern validation, QC gate

**Output** → `output_schema.md`  
Structured weekly program: sessions, blocks, exercises, sets, reps, rest, notes

**Substitution** → `substitution_rules.md`  
Equipment constraints, injury flags, fatigue-adjusted alternatives

---

## Operating Principles

- No improvisation. System operates within defined constraints.
- Movement-based design, not muscle-group splits.
- Full-body exposure across the training week.
- Maximum 2 High CNS sessions per week. No consecutive High CNS days.
- Never train to failure on primary lifts (1–3 RIR maintained).
- Deload every 6–8 weeks or on performance drop.

---

## Brand

- **Institution**: Deus Performance
- **Operating entity**: Riz Management LLC
- **Tagline**: *Deus. The body is a gift. Train it accordingly.*
- **Service model**: Fulfillment-as-a-service coaching practice

---

*End.*

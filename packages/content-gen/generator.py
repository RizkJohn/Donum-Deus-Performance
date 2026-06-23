from __future__ import annotations

import json
import logging
import random

from anthropic import Anthropic

log = logging.getLogger(__name__)

# Each pillar is a specific enough seed that Claude will produce concrete, varied angles.
# Pillars reflect the Deus Performance brand positioning: constraint-driven training,
# CNS management, movement patterns, objective hierarchy, recovery, and mindset.
CONTENT_PILLARS = [
    # Constraint-driven training — the DP method
    "constraint-training — why a fixed objective hierarchy produces better outcomes than flexible programming",
    "constraint-training — the CNS budget: why you cannot train heavy twice in a row and expect full output",
    "constraint-training — the difference between volume fatigue and neural fatigue, and why it matters",
    "constraint-training — why 1–3 RIR on primary lifts is not conservative — it is correct",
    "constraint-training — deload timing: when the data says back off, backing off is the training",
    "constraint-training — why the engine returns an error rather than a degraded programme",
    "constraint-training — fatigue-adaptive volume: cutting reps, not weight, when recovery is low",
    # CNS management
    "cns-management — what high-CNS training actually means and how to identify it in your week",
    "cns-management — the 48–72 hour neural recovery window and what compromises it",
    "cns-management — why two hard sessions back-to-back compound fatigue instead of doubling stimulus",
    "cns-management — HRV as a readiness signal: how to read it without overthinking it",
    "cns-management — the pre-competition Low CNS rule and why it exists",
    # Movement patterns
    "movement-patterns — why squat, hinge, push, pull, rotation, carry, and jump cover everything",
    "movement-patterns — the hinge pattern: posterior chain development and why most people do it wrong",
    "movement-patterns — horizontal vs vertical pulling: why both are required every week",
    "movement-patterns — rotation and anti-rotation: the core as a force-transfer mechanism, not an aesthetic feature",
    "movement-patterns — carry and locomotion: the underrated pattern that builds structural resilience",
    "movement-patterns — why a muscle-group split is an organisational convenience, not a physiological principle",
    # Objective hierarchy
    "objective-hierarchy — joint integrity first: why building on a damaged joint produces a damaged athlete",
    "objective-hierarchy — movement quality before load: the squat performed poorly under weight builds a stronger fault",
    "objective-hierarchy — why strength is third, not first, in the hierarchy",
    "objective-hierarchy — work capacity as the engine beneath everything else",
    "objective-hierarchy — hypertrophy as a consequence of well-structured training, not a primary objective",
    # Recovery science
    "recovery-science — sleep architecture and the deep sleep window where training adaptations are consolidated",
    "recovery-science — why post-session nutrition timing matters for the 48-hour adaptation window",
    "recovery-science — active recovery vs rest days: the case for deliberate low-intensity movement",
    "recovery-science — progressive overload requires progressive recovery — why one without the other stalls",
    # Athlete mindset
    "athlete-mindset — identity-based training: performing to an internal standard, not an external comparison",
    "athlete-mindset — discipline architecture: building an environment where the right action is the easy action",
    "athlete-mindset — process over outcome: why the athlete who controls inputs outperforms the one who chases results",
    "athlete-mindset — adversity response: the difference between fatigue that requires rest and discomfort that requires resilience",
    "athlete-mindset — why removing optionality from your training produces more consistency than willpower",
]

SYSTEM_PROMPT = """\
You are the content engine for "Deus Performance" — a faceless elite coaching brand \
built on constraint-driven adaptive training. The brand positioning: movement-based, \
CNS-managed, fatigue-adaptive programming governed by hard physiological rules.

Brand voice: Precise. Disciplined. No hype. Authoritative. Short, declarative sentences. \
No motivational clichés. Every claim should be grounded in a physiological principle. \
The brand has no face — all content works as text overlays, voiceover on B-roll, or motion graphics. \
Tagline: "The body is a gift. Train it accordingly."

Respond ONLY with a valid JSON object. No markdown fences, no preamble, no extra text:
{
  "topic": "the specific angle you chose",
  "hook": "attention-grabbing opener",
  "body": "main content body",
  "cta": "call to action",
  "hashtags": ["tag1", "tag2"],
  "visualNote": "production direction"
}

PLATFORM RULES:
- Instagram: Hook = scroll-stopping 1-2 lines. Body = 4-6 short punchy paragraphs separated \
by newlines, or a tight bullet list with "→". CTA = strong directive. 7-10 hashtags (no # prefix). \
visualNote = B-roll concept or graphic idea.
- TikTok: Hook = exact on-screen text for first 2 seconds (under 8 words, powerful). \
Body = 30-60s script broken into [0:00] [0:08] [0:20] timestamp format. CTA = end screen text. \
4-6 hashtags (no # prefix). visualNote = clip-by-clip visual direction.
- Threads: Hook = one punchy opening line. Body = 2-3 hard-hitting sentences. \
CTA = question or sharp directive. 2-3 hashtags (no # prefix). visualNote = "none" or brief image note.

CONTENT TYPE RULES:
- Motivational: Mental edge, discipline, identity, standards, grit. Real and earned — no toxic \
positivity. Hit the reader where it hurts, then lift them up.
- Educational: Specific, actionable tips on technique, biomechanics, training science, recovery. \
One clear takeaway per post. Make complex simple.

Always use "you/your" or declarative statements. Never use first-person coach voice. \
This brand has no face.\
"""


def generate_post(client: Anthropic, platform: str, content_type: str) -> dict:
    """Generate a full post for the given platform and content type.

    Randomly selects a content pillar and asks Claude to pick a concrete angle within it.
    Returns the parsed JSON dict: topic, hook, body, cta, hashtags, visualNote.
    """
    pillar = random.choice(CONTENT_PILLARS)
    log.debug("Pillar: %s", pillar)

    user_msg = (
        f"Platform: {platform}\n"
        f"Type: {content_type}\n"
        f"Content pillar: {pillar}\n\n"
        "Generate a Deus Performance post now. Choose one precise, concrete angle within "
        "the pillar — avoid generic filler. Make it hit."
    )

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_msg}],
    )

    raw = "".join(b.text for b in response.content if b.type == "text")
    clean = raw.replace("```json", "").replace("```", "").strip()
    return json.loads(clean)

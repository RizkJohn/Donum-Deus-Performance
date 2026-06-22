from __future__ import annotations

import json
import logging
import random

from anthropic import Anthropic

log = logging.getLogger(__name__)

# Each pillar is a specific enough seed that Claude will produce concrete, varied angles.
CONTENT_PILLARS = [
    "swimming — freestyle catch phase, early vertical forearm, and elbow position",
    "swimming — underwater dolphin kick efficiency, depth, and breakout timing",
    "swimming — flip turn mechanics, push-off angle, and streamline lock",
    "swimming — breathing rhythm under race pressure and CO2 tolerance training",
    "swimming — backstroke rotation, catch, and hip-driven power transfer",
    "swimming — breaststroke pullout sequence, glide timing, and undulation",
    "swimming — pacing strategy and negative splits in distance events",
    "swimming — open water sighting technique and draft positioning",
    "athletic performance — explosive starting strength and rate of force development",
    "athletic performance — sprint mechanics, drive phase, and maximum velocity",
    "athletic performance — posterior chain power for swimming and field sports",
    "athletic performance — deceleration, change of direction, and knee-joint loading",
    "recovery — sleep architecture, deep sleep quality, and performance adaptation",
    "recovery — HRV interpretation, readiness scores, and training load management",
    "recovery — cold exposure protocols and neuromuscular recovery windows",
    "recovery — active recovery protocols vs rest days: when and why",
    "high-performance mindset — identity-based training and internal standards over outcomes",
    "high-performance mindset — adversity response and performing under competitive pressure",
    "high-performance mindset — discipline architecture and environment design",
    "high-performance mindset — visualization, pre-performance routines, and arousal control",
    "high-performance mindset — the dichotomy of control: what you own vs what you release",
    "training science — progressive overload, periodization phases, and peak timing",
    "training science — taper strategy and competition-day physiological readiness",
    "training science — specificity principle and sport-transfer training design",
    "training science — CNS fatigue, intensity management, and session sequencing",
    "nutrition — pre-training fueling, carbohydrate timing, and glycogen loading",
    "nutrition — hydration strategy and electrolyte balance for pool athletes",
    "nutrition — post-session recovery nutrition and protein synthesis windows",
    "biomechanics — joint stacking, posture under fatigue, and technique preservation",
    "biomechanics — shoulder health, internal rotation limits, and injury prevention for swimmers",
]

SYSTEM_PROMPT = """\
You are the content engine for "Deus Performance" — a faceless elite online coaching brand \
for athletic performance, swimming technique, and high-performance mindset.

Brand voice: Bold. Direct. No fluff. Authoritative. Aspirational. Short punchy sentences. \
The brand has no face — all content works as text overlays, voiceover on B-roll, or motion graphics.

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

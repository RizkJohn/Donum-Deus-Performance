# Offer model — free diagnosis, paid practice

Decision: **neither** a hard paywall (pay before you see anything) **nor**
open freemium (unlimited free programs forever). One complete, real program
free per email, no account required. A second program — the adaptive,
ongoing relationship — requires an active subscription.

## Why not a hard paywall

Every comparable in the premium coaching space converts on a **free
consultation**, not a paywall: luxury/high-end personal training begins with
an in-depth free consultation to assess fit and objectives before any money
changes hands, and even at the high end (Future, $149–199/mo human coaching)
the objection-handling mechanism is a money-back guarantee on the first
month, not "pay first, evaluate later." A brand built on rigor and precision
loses credibility if it asks for a card before proving the rigor. The engine
*is* the product's proof — hiding it behind a paywall means selling on trust
alone, which this brand hasn't earned from a first-time visitor yet.

## Why not open freemium

General SaaS data favors freemium for top-of-funnel volume (freemium
produces more total paying customers than free trials at scale — ~5 paying
customers per 1,000 visitors vs. ~3.6 for trials), but that data comes from
low-price, high-volume, self-serve software. It doesn't transfer cleanly to
a $20–240/mo coaching product where the entire differentiated value is the
*adaptive relationship over time* (fatigue model, progression, athlete
state folding forward each cycle) — not the one-off artifact. Unlimited free
regeneration would commoditize the exact thing being sold and contradicts
the brand's disciplined, non-hype voice (open-ended freemium loops read as
consumer-app growth-hacking).

## Why "one program," not a time-boxed trial

Fitness-app paywall research is consistent on two points that both point
away from a calendar-based trial: (1) gate the *outcome* (ongoing,
adaptive personalization), not a slice of content — a stripped-down first
program would undersell the engine; (2) demonstrate real value before
asking for payment, then convert at the point the user has actually seen
that value, not on a countdown. The product's natural unit is a training
*cycle*, not a day — a 7/14-day trial clock is the wrong shape for something
consumed weekly. A count-based gate (one program) needs no trial-expiry
logic and maps directly onto how the product is actually used.

## The mechanic

- Every email gets exactly one program with a real result: full weekly
  split, full session detail, the Coach's Read, and the downloadable PDF.
  Nothing is stripped down — the free tier's job is to prove the engine, not
  sample it.
- A second `/v1/assess` call for the same email requires an active
  subscription (`subscription_status` in `{active, trialing}` on that
  email's `User` row). Enforced server-side in `routes/assess.py` via
  `billing/access.py` — never trust a client-side gate for something this
  central to revenue.
- An `UNSATISFIABLE_CONSTRAINTS` result never spends the free program — the
  engine declining to compromise isn't a delivered product, and the funnel
  already invites the athlete to adjust their answers and resubmit.
- No discount/urgency copy ("74% off," "trial ends in 3 days"). The
  upgrade prompt (`AssessmentFunnel.tsx`'s `subscription_required` phase)
  reads: *"The diagnosis is done. The practice continues."* — consistent
  with the brand's institutional, non-hype register, and consistent with
  the existing Foundation/Practice/Stewardship framing (the free layer is
  the diagnosis; paying is entering the practice).
- Practice and Stewardship (human-reviewed/coach-led tiers) were never
  going to be free — this only changes what happens after the first
  Foundation-equivalent program.

## What this doesn't cover (still open)

- Whether to add a Future-style money-back guarantee on the first paid
  cycle, as a policy (refund via Stripe dashboard, not code) rather than a
  trial.
- Whether Practice/Stewardship applicants should see a different framing on
  `/apply`-style flows than Foundation subscribers — out of scope for this
  change, no code currently distinguishes them pre-payment.

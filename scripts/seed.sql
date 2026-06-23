-- Deus Performance — Supabase schema seed
-- Run once against a fresh Supabase project: psql $DATABASE_URL -f scripts/seed.sql
-- All tables use UUID primary keys and enable Row Level Security (configure policies
-- in the Supabase dashboard after seeding).

-- practitioners: core profile + subscription state
CREATE TABLE IF NOT EXISTS practitioners (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email               TEXT UNIQUE NOT NULL,
  full_name           TEXT,
  tier                TEXT CHECK (tier IN ('foundation', 'practice', 'stewardship')),
  stripe_customer_id  TEXT,
  subscription_status TEXT,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- intake_profiles: persistent athlete state (profile, schedule, fatigue/injury state)
CREATE TABLE IF NOT EXISTS intake_profiles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id  UUID REFERENCES practitioners(id) ON DELETE CASCADE,
  profile          JSONB NOT NULL,  -- age, weight, experience, goals
  schedule         JSONB NOT NULL,  -- training days, sport days, session duration
  state            JSONB NOT NULL,  -- fatigue score, injuries, equipment restrictions
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- programmes: engine-generated weekly programme outputs
CREATE TABLE IF NOT EXISTS programmes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id  UUID REFERENCES practitioners(id) ON DELETE CASCADE,
  intake_id        UUID REFERENCES intake_profiles(id),
  output           JSONB NOT NULL,  -- full engine JSON output (output_schema.md)
  week_start       DATE,
  flags            JSONB,           -- deload, progress, maintain
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- applications: T2/T3 intake questionnaire submissions
CREATE TABLE IF NOT EXISTS applications (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          TEXT NOT NULL,
  full_name      TEXT,
  tier_requested TEXT CHECK (tier_requested IN ('practice', 'stewardship')),
  questionnaire  JSONB,
  status         TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- subscribers: email list (lead magnet, blog, engine, direct)
CREATE TABLE IF NOT EXISTS subscribers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  source     TEXT CHECK (source IN ('lead_magnet', 'blog', 'engine', 'direct')),
  created_at TIMESTAMPTZ DEFAULT now()
);

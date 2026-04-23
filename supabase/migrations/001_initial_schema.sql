-- =============================================================================
-- GolfDraw: Initial Database Schema
-- Migration: 001_initial_schema.sql
-- Description: Creates all tables, indexes, triggers, functions, and RLS policies
--              for the GolfDraw subscription/draw platform.
--
-- NOTE ON AUTH STRATEGY:
--   This project uses NextAuth (not Supabase Auth) for session management.
--   User identity is established via email from NextAuth sessions.
--   All mutating operations (INSERT/UPDATE/DELETE) on sensitive tables are
--   performed via the Supabase SERVICE ROLE key from Next.js API routes.
--   RLS policies therefore use a mix of:
--     - service_role bypass (default Supabase behaviour — service_role bypasses RLS)
--     - anon/authenticated role for safe read-only operations
--   Where user-scoped reads are required, the calling API route must filter by
--   the authenticated user's ID explicitly (passed from NextAuth session).
-- =============================================================================

-- Enable pgcrypto for gen_random_uuid() (available by default in Supabase)
-- gen_random_uuid() is built-in from PostgreSQL 13+; no extension needed.

-- =============================================================================
-- TABLE: users
-- Stores platform user profiles linked to NextAuth sessions by email.
-- =============================================================================
CREATE TABLE users (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email             text        UNIQUE NOT NULL,
  full_name         text        NOT NULL,
  avatar_url        text,
  role              text        NOT NULL DEFAULT 'subscriber'
                                  CHECK (role IN ('subscriber', 'admin')),
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

-- =============================================================================
-- TABLE: subscriptions
-- Tracks Stripe subscription state for each user.
-- Amount stored in pence (integer) — never floats.
-- =============================================================================
CREATE TABLE subscriptions (
  id                        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   uuid        REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id        text        UNIQUE,
  stripe_subscription_id    text        UNIQUE,
  plan                      text        NOT NULL CHECK (plan IN ('monthly', 'yearly')),
  status                    text        NOT NULL DEFAULT 'inactive'
                                          CHECK (status IN ('active', 'inactive', 'cancelled', 'lapsed')),
  current_period_start      timestamptz,
  current_period_end        timestamptz,
  amount_pence              integer     NOT NULL,
  created_at                timestamptz DEFAULT now(),
  updated_at                timestamptz DEFAULT now()
);

-- =============================================================================
-- TABLE: charities
-- Charity organisations that subscribers can direct their contributions to.
-- =============================================================================
CREATE TABLE charities (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text        NOT NULL,
  description   text,
  image_url     text,
  website_url   text,
  is_featured   boolean     DEFAULT false,
  is_active     boolean     DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

-- =============================================================================
-- TABLE: user_charity_selections
-- Each subscriber selects exactly one charity; contribution_percentage >= 10%.
-- UNIQUE on user_id enforces one charity selection per user at a time.
-- =============================================================================
CREATE TABLE user_charity_selections (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid        REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  charity_id              uuid        REFERENCES charities(id),
  contribution_percentage integer     NOT NULL DEFAULT 10
                                        CHECK (contribution_percentage >= 10 AND contribution_percentage <= 100),
  updated_at              timestamptz DEFAULT now()
);

-- =============================================================================
-- TABLE: scores
-- Stableford scores (1–45) per user per date. Max 5 per user (enforced by
-- the evict_oldest_score trigger). No duplicate dates per user (UNIQUE).
-- =============================================================================
CREATE TABLE scores (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        REFERENCES users(id) ON DELETE CASCADE,
  score_value integer     NOT NULL CHECK (score_value >= 1 AND score_value <= 45),
  score_date  date        NOT NULL,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, score_date)
);

-- =============================================================================
-- TABLE: draws
-- Each monthly draw. draw_month stores the first day of the month.
-- winning_numbers is an array of 5 integers (1–45).
-- All monetary values in pence (integers).
-- =============================================================================
CREATE TABLE draws (
  id                        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_month                date        NOT NULL UNIQUE,  -- first day of the month
  status                    text        NOT NULL DEFAULT 'pending'
                                          CHECK (status IN ('pending', 'simulated', 'published')),
  draw_mode                 text        NOT NULL DEFAULT 'random'
                                          CHECK (draw_mode IN ('random', 'weighted')),
  winning_numbers           integer[],  -- array of 5 numbers, each 1–45
  jackpot_amount_pence      integer     DEFAULT 0,
  four_match_amount_pence   integer     DEFAULT 0,
  three_match_amount_pence  integer     DEFAULT 0,
  rollover_amount_pence     integer     DEFAULT 0,  -- carried from previous month if no 5-match winner
  total_pool_pence          integer     DEFAULT 0,
  subscriber_count          integer     DEFAULT 0,
  published_at              timestamptz,
  created_at                timestamptz DEFAULT now()
);

-- =============================================================================
-- TABLE: draw_entries
-- One entry per user per draw. submitted_numbers = user's 5 scores used as picks.
-- match_count and is_winner are populated when the draw is published.
-- =============================================================================
CREATE TABLE draw_entries (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id           uuid        REFERENCES draws(id) ON DELETE CASCADE,
  user_id           uuid        REFERENCES users(id) ON DELETE CASCADE,
  submitted_numbers integer[],  -- user's 5 score values used as entry numbers
  match_count       integer     DEFAULT 0,
  is_winner         boolean     DEFAULT false,
  created_at        timestamptz DEFAULT now(),
  UNIQUE (draw_id, user_id)
);

-- =============================================================================
-- TABLE: winners
-- Records prize winners for each draw. Prizes awarded by match_type bucket.
-- Verification and payout tracked here for admin workflow.
-- =============================================================================
CREATE TABLE winners (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id               uuid        REFERENCES draws(id),
  user_id               uuid        REFERENCES users(id),
  draw_entry_id         uuid        REFERENCES draw_entries(id),
  match_type            text        NOT NULL
                                      CHECK (match_type IN ('five_match', 'four_match', 'three_match')),
  prize_amount_pence    integer     NOT NULL,
  verification_status   text        NOT NULL DEFAULT 'pending'
                                      CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  proof_url             text,
  payout_status         text        NOT NULL DEFAULT 'unpaid'
                                      CHECK (payout_status IN ('unpaid', 'paid')),
  payout_at             timestamptz,
  admin_notes           text,
  created_at            timestamptz DEFAULT now()
);

-- =============================================================================
-- TABLE: charity_donations
-- Records individual charity contributions, either from subscription portions
-- or independent direct donations.
-- =============================================================================
CREATE TABLE charity_donations (
  id                        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   uuid        REFERENCES users(id),
  charity_id                uuid        REFERENCES charities(id),
  amount_pence              integer     NOT NULL,
  donation_type             text        NOT NULL
                                          CHECK (donation_type IN ('subscription_portion', 'independent')),
  stripe_payment_intent_id  text,
  created_at                timestamptz DEFAULT now()
);

-- =============================================================================
-- INDEXES
-- Covering all foreign key columns and commonly queried fields.
-- =============================================================================

-- users
CREATE INDEX idx_users_email ON users(email);

-- subscriptions
CREATE INDEX idx_subscriptions_user_id              ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id   ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status               ON subscriptions(status);

-- scores
CREATE INDEX idx_scores_user_id    ON scores(user_id);
CREATE INDEX idx_scores_score_date ON scores(score_date);
CREATE INDEX idx_scores_user_date  ON scores(user_id, score_date);

-- draws
CREATE INDEX idx_draws_draw_month ON draws(draw_month);
CREATE INDEX idx_draws_status     ON draws(status);

-- draw_entries
CREATE INDEX idx_draw_entries_draw_id ON draw_entries(draw_id);
CREATE INDEX idx_draw_entries_user_id ON draw_entries(user_id);

-- winners
CREATE INDEX idx_winners_draw_id      ON winners(draw_id);
CREATE INDEX idx_winners_user_id      ON winners(user_id);
CREATE INDEX idx_winners_draw_entry_id ON winners(draw_entry_id);

-- charity_donations
CREATE INDEX idx_charity_donations_user_id    ON charity_donations(user_id);
CREATE INDEX idx_charity_donations_charity_id ON charity_donations(charity_id);

-- user_charity_selections
CREATE INDEX idx_user_charity_selections_charity_id ON user_charity_selections(charity_id);

-- =============================================================================
-- FUNCTION: updated_at_trigger()
-- Generic trigger function: sets updated_at = now() on any row UPDATE.
-- Applied to: users, subscriptions, scores, user_charity_selections
-- =============================================================================
CREATE OR REPLACE FUNCTION updated_at_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION updated_at_trigger();

CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION updated_at_trigger();

CREATE TRIGGER trg_scores_updated_at
  BEFORE UPDATE ON scores
  FOR EACH ROW EXECUTE FUNCTION updated_at_trigger();

CREATE TRIGGER trg_user_charity_selections_updated_at
  BEFORE UPDATE ON user_charity_selections
  FOR EACH ROW EXECUTE FUNCTION updated_at_trigger();

-- =============================================================================
-- FUNCTION: evict_oldest_score()
-- Trigger function (BEFORE INSERT on scores).
-- If a user already has 5 scores, the row with the oldest score_date is deleted
-- before the new row is inserted, keeping the cap at exactly 5 per user.
-- =============================================================================
CREATE OR REPLACE FUNCTION evict_oldest_score()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_count integer;
BEGIN
  -- Count current scores for this user
  SELECT COUNT(*) INTO v_count
  FROM scores
  WHERE user_id = NEW.user_id;

  IF v_count >= 5 THEN
    -- Delete the score with the oldest score_date for this user
    DELETE FROM scores
    WHERE id = (
      SELECT id
      FROM scores
      WHERE user_id = NEW.user_id
      ORDER BY score_date ASC
      LIMIT 1
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_evict_oldest_score
  BEFORE INSERT ON scores
  FOR EACH ROW EXECUTE FUNCTION evict_oldest_score();

-- =============================================================================
-- FUNCTION: calculate_prize_pool(subscriber_count, subscription_amount_pence, rollover_pence)
-- Returns the prize breakdown for a draw in pence (integers).
-- Split: 40% jackpot, 35% four-match, 25% three-match.
-- All amounts rounded to the nearest pence (ROUND).
-- =============================================================================
CREATE OR REPLACE FUNCTION calculate_prize_pool(
  subscriber_count        integer,
  subscription_amount_pence integer,
  rollover_pence          integer DEFAULT 0
)
RETURNS TABLE (
  jackpot     integer,
  four_match  integer,
  three_match integer,
  total       integer
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_from_subs integer;
  v_total           integer;
BEGIN
  v_total_from_subs := subscriber_count * subscription_amount_pence;
  v_total           := v_total_from_subs + rollover_pence;

  RETURN QUERY SELECT
    ROUND(v_total * 0.40)::integer AS jackpot,
    ROUND(v_total * 0.35)::integer AS four_match,
    ROUND(v_total * 0.25)::integer AS three_match,
    v_total                         AS total;
END;
$$;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
-- IMPORTANT: The Supabase SERVICE ROLE key bypasses all RLS policies.
-- All admin/system mutations (Stripe webhooks, draw engine, admin actions)
-- must use the service role key (SUPABASE_SERVICE_ROLE_KEY) from server-side
-- Next.js API routes — never expose this key to the browser.
--
-- The ANON key (used by the browser Supabase client) is subject to RLS.
-- Since we use NextAuth (not Supabase Auth), auth.uid() is NOT available in
-- browser requests. User-scoped data access via the anon key should be avoided;
-- all user-scoped reads must go through Next.js API routes using the service
-- role, which then filter by the NextAuth session user's ID.
--
-- The policies below are defensive: they deny all access via the anon role
-- except for explicitly public data (charities), and they allow authenticated
-- Supabase users (if ever used) to read their own data. Service role always
-- bypasses RLS regardless.
-- =============================================================================

-- ---- users ------------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Public cannot read users; service role handles all access.
-- If Supabase Auth is ever layered on, a user can read their own row by email.
CREATE POLICY "users_select_own"
  ON users FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = email);

-- All writes go through service role (NextAuth upsert on sign-in).
-- No INSERT/UPDATE/DELETE policies for anon/authenticated needed.

-- ---- subscriptions ----------------------------------------------------------
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscription via a join through users.email.
CREATE POLICY "subscriptions_select_own"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    user_id = (
      SELECT id FROM users WHERE email = auth.jwt() ->> 'email' LIMIT 1
    )
  );

-- INSERT/UPDATE handled by service role (Stripe webhook handler).

-- ---- charities --------------------------------------------------------------
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;

-- Charities are public information — anyone (anon or authenticated) can read.
CREATE POLICY "charities_select_public"
  ON charities FOR SELECT
  TO anon, authenticated
  USING (true);

-- All mutations via service role only.

-- ---- user_charity_selections ------------------------------------------------
ALTER TABLE user_charity_selections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_charity_selections_select_own"
  ON user_charity_selections FOR SELECT
  TO authenticated
  USING (
    user_id = (
      SELECT id FROM users WHERE email = auth.jwt() ->> 'email' LIMIT 1
    )
  );

-- Users can insert/update their own selection (via API route using service role in practice).
CREATE POLICY "user_charity_selections_insert_own"
  ON user_charity_selections FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (
      SELECT id FROM users WHERE email = auth.jwt() ->> 'email' LIMIT 1
    )
  );

CREATE POLICY "user_charity_selections_update_own"
  ON user_charity_selections FOR UPDATE
  TO authenticated
  USING (
    user_id = (
      SELECT id FROM users WHERE email = auth.jwt() ->> 'email' LIMIT 1
    )
  );

-- ---- scores -----------------------------------------------------------------
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scores_select_own"
  ON scores FOR SELECT
  TO authenticated
  USING (
    user_id = (
      SELECT id FROM users WHERE email = auth.jwt() ->> 'email' LIMIT 1
    )
  );

CREATE POLICY "scores_insert_own"
  ON scores FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (
      SELECT id FROM users WHERE email = auth.jwt() ->> 'email' LIMIT 1
    )
  );

CREATE POLICY "scores_update_own"
  ON scores FOR UPDATE
  TO authenticated
  USING (
    user_id = (
      SELECT id FROM users WHERE email = auth.jwt() ->> 'email' LIMIT 1
    )
  );

CREATE POLICY "scores_delete_own"
  ON scores FOR DELETE
  TO authenticated
  USING (
    user_id = (
      SELECT id FROM users WHERE email = auth.jwt() ->> 'email' LIMIT 1
    )
  );

-- ---- draws ------------------------------------------------------------------
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read published draws.
CREATE POLICY "draws_select_published"
  ON draws FOR SELECT
  TO authenticated
  USING (status = 'published');

-- Anon users can also view published draws (landing page prize pool display).
CREATE POLICY "draws_select_published_anon"
  ON draws FOR SELECT
  TO anon
  USING (status = 'published');

-- INSERT/UPDATE via service role only (admin-triggered draw actions).

-- ---- draw_entries -----------------------------------------------------------
ALTER TABLE draw_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "draw_entries_select_own"
  ON draw_entries FOR SELECT
  TO authenticated
  USING (
    user_id = (
      SELECT id FROM users WHERE email = auth.jwt() ->> 'email' LIMIT 1
    )
  );

-- INSERT is system-only (draw engine via service role); no authenticated INSERT policy.

-- ---- winners ----------------------------------------------------------------
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;

-- Users can see their own winner records.
CREATE POLICY "winners_select_own"
  ON winners FOR SELECT
  TO authenticated
  USING (
    user_id = (
      SELECT id FROM users WHERE email = auth.jwt() ->> 'email' LIMIT 1
    )
  );

-- UPDATE (verification/payout) via service role only.

-- ---- charity_donations ------------------------------------------------------
ALTER TABLE charity_donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "charity_donations_select_own"
  ON charity_donations FOR SELECT
  TO authenticated
  USING (
    user_id = (
      SELECT id FROM users WHERE email = auth.jwt() ->> 'email' LIMIT 1
    )
  );

CREATE POLICY "charity_donations_insert_own"
  ON charity_donations FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (
      SELECT id FROM users WHERE email = auth.jwt() ->> 'email' LIMIT 1
    )
  );

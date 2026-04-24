-- =============================================================================
-- GolfDraw: Seed Data
-- File: /supabase/seed.sql
-- Purpose: Populates the database with realistic initial data for development
--          and testing. Run AFTER 001_initial_schema.sql.
--
-- WARNING: This file is for development/staging only.
--          Do NOT run against a production database.
-- =============================================================================

-- =============================================================================
-- CHARITIES (3 realistic UK golf/sport charities)
-- =============================================================================
INSERT INTO charities (id, name, description, image_url, website_url, is_featured, is_active)
VALUES
  (
    'a1000000-0000-0000-0000-000000000001',
    'Golf Foundation',
    'The Golf Foundation is the UK''s leading golf development charity, introducing young people to golf and helping them develop life skills through the sport. We work with schools, coaches, and clubs to make golf accessible to all backgrounds.',
    'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400',
    'https://www.golf-foundation.org',
    true,
    true
  ),
  (
    'a1000000-0000-0000-0000-000000000002',
    'Birdies for Brain Cancer',
    'Birdies for Brain Cancer raises vital funds for brain cancer research through golf events and community fundraising across the UK. Every pound raised goes directly to research programmes at leading UK hospitals.',
    'https://images.unsplash.com/photo-1611232658409-0d98127f237f?w=400',
    'https://www.birdiesforbraincancer.org',
    true,
    true
  ),
  (
    'a1000000-0000-0000-0000-000000000003',
    'Greenkeepers Welfare Trust',
    'The Greenkeepers Welfare Trust provides financial assistance, counselling, and welfare support to greenkeepers and their families who are facing hardship. Protecting the people who protect our courses.',
    'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400',
    'https://www.bigga.org.uk/welfare',
    false,
    true
  );

-- =============================================================================
-- USERS
-- admin@golfdraw.com — platform administrator
-- test@golfdraw.com  — standard subscriber used for testing
-- =============================================================================
INSERT INTO users (id, email, full_name, avatar_url, role, created_at, updated_at)
VALUES
  (
    'b1000000-0000-0000-0000-000000000001',
    'admin@golfdraw.com',
    'GolfDraw Admin',
    NULL,
    'admin',
    now() - interval '90 days',
    now() - interval '90 days'
  ),
  (
    'b1000000-0000-0000-0000-000000000002',
    'test@golfdraw.com',
    'James Thornton',
    NULL,
    'subscriber',
    now() - interval '30 days',
    now() - interval '30 days'
  );

-- =============================================================================
-- SUBSCRIPTIONS
-- Active monthly subscription for the test user (amount: £19.99 = 1999 pence)
-- =============================================================================
INSERT INTO subscriptions (
  id,
  user_id,
  stripe_customer_id,
  stripe_subscription_id,
  plan,
  status,
  current_period_start,
  current_period_end,
  amount_pence,
  created_at,
  updated_at
)
VALUES
  (
    'c1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000002',  -- test user
    'cus_test_golfdraw_001',
    'sub_test_golfdraw_001',
    'monthly',
    'active',
    date_trunc('month', now()),              -- start of current month
    date_trunc('month', now()) + interval '1 month',  -- end of current month
    1999,                                    -- £19.99 in pence
    now() - interval '30 days',
    now() - interval '1 day'
  );

-- =============================================================================
-- SCORES for test user
-- 5 Stableford scores over the last ~30 days (values 20–38)
-- Dates spaced to avoid the UNIQUE(user_id, score_date) constraint.
-- NOTE: The evict_oldest_score trigger fires on INSERT, but since we are
-- inserting exactly 5 records for a fresh user, no eviction occurs.
-- =============================================================================
INSERT INTO scores (id, user_id, score_value, score_date, created_at, updated_at)
VALUES
  (
    'd1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000002',
    22,
    current_date - interval '28 days',
    now() - interval '28 days',
    now() - interval '28 days'
  ),
  (
    'd1000000-0000-0000-0000-000000000002',
    'b1000000-0000-0000-0000-000000000002',
    35,
    current_date - interval '21 days',
    now() - interval '21 days',
    now() - interval '21 days'
  ),
  (
    'd1000000-0000-0000-0000-000000000003',
    'b1000000-0000-0000-0000-000000000002',
    29,
    current_date - interval '14 days',
    now() - interval '14 days',
    now() - interval '14 days'
  ),
  (
    'd1000000-0000-0000-0000-000000000004',
    'b1000000-0000-0000-0000-000000000002',
    38,
    current_date - interval '7 days',
    now() - interval '7 days',
    now() - interval '7 days'
  ),
  (
    'd1000000-0000-0000-0000-000000000005',
    'b1000000-0000-0000-0000-000000000002',
    31,
    current_date - interval '2 days',
    now() - interval '2 days',
    now() - interval '2 days'
  );

-- =============================================================================
-- CHARITY SELECTION for test user
-- Selects "Golf Foundation" (charity 1) with minimum 10% contribution
-- =============================================================================
INSERT INTO user_charity_selections (
  id,
  user_id,
  charity_id,
  contribution_percentage,
  updated_at
)
VALUES
  (
    'e1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000002',  -- test user
    'a1000000-0000-0000-0000-000000000001',  -- Golf Foundation
    10,
    now() - interval '28 days'
  );

-- =============================================================================
-- UPCOMING DRAW (current month, status: pending)
-- draw_month = first day of the current month
-- Prize pool calculated for ~100 subscribers at £19.99/month = £1,999 total
--   Jackpot  (40%) = £ 799.60 = 79960 pence
--   4-match  (35%) = £ 699.65 = 69965 pence
--   3-match  (25%) = £ 499.75 = 49975 pence
--   Total          = £1999.00 = 199900 pence
-- =============================================================================
INSERT INTO draws (
  id,
  draw_month,
  status,
  draw_mode,
  winning_numbers,
  jackpot_amount_pence,
  four_match_amount_pence,
  three_match_amount_pence,
  rollover_amount_pence,
  total_pool_pence,
  subscriber_count,
  published_at,
  created_at
)
VALUES
  (
    'f1000000-0000-0000-0000-000000000001',
    date_trunc('month', current_date)::date,  -- first day of current month
    'pending',
    'random',
    NULL,         -- winning numbers not yet drawn
    79960,        -- 40% of 199900
    69965,        -- 35% of 199900
    49975,        -- 25% of 199900
    0,            -- no rollover this month
    199900,       -- 100 subscribers × 1999 pence
    100,
    NULL,         -- not yet published
    now()
  );

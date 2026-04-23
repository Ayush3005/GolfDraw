// =============================================================================
// GolfDraw — Database TypeScript Types
// Auto-matched to Supabase snake_case column names.
// All monetary values are in pence (integers) — never floats.
// =============================================================================

// ---------------------------------------------------------------------------
// Literal union types (mirrors SQL CHECK constraints)
// ---------------------------------------------------------------------------

export type UserRole = 'subscriber' | 'admin'

export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'lapsed'

export type SubscriptionPlan = 'monthly' | 'yearly'

export type DrawStatus = 'pending' | 'simulated' | 'published'

export type DrawMode = 'random' | 'weighted'

export type MatchType = 'five_match' | 'four_match' | 'three_match'

export type VerificationStatus = 'pending' | 'approved' | 'rejected'

export type PayoutStatus = 'unpaid' | 'paid'

export type DonationType = 'subscription_portion' | 'independent'

// ---------------------------------------------------------------------------
// Table interfaces (snake_case to match Supabase JSON responses exactly)
// ---------------------------------------------------------------------------

/** Platform user profile — linked to NextAuth sessions by email. */
export interface User {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

/** Stripe-backed subscription record. amount_pence is stored in pence (integer). */
export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  plan: SubscriptionPlan
  status: SubscriptionStatus
  current_period_start: string | null
  current_period_end: string | null
  amount_pence: number
  created_at: string
  updated_at: string
}

/** Charity organisation available for subscriber contributions. */
export interface Charity {
  id: string
  name: string
  description: string | null
  image_url: string | null
  website_url: string | null
  is_featured: boolean
  is_active: boolean
  created_at: string
}

/** Subscriber's chosen charity and contribution percentage (min 10%). */
export interface UserCharitySelection {
  id: string
  user_id: string
  charity_id: string
  contribution_percentage: number
  updated_at: string
}

/**
 * A single Stableford score (1–45) for a user on a given date.
 * Max 5 scores per user; oldest auto-evicted on insert.
 */
export interface Score {
  id: string
  user_id: string
  score_value: number
  score_date: string  // ISO date string: "YYYY-MM-DD"
  created_at: string
  updated_at: string
}

/**
 * Monthly draw record. draw_month is always the first day of the month.
 * winning_numbers is an array of 5 integers (1–45).
 * All monetary amounts in pence (integers).
 */
export interface Draw {
  id: string
  draw_month: string          // ISO date string, first day of month: "YYYY-MM-01"
  status: DrawStatus
  draw_mode: DrawMode
  winning_numbers: number[] | null    // 5 numbers, each 1–45; null until draw is run
  jackpot_amount_pence: number
  four_match_amount_pence: number
  three_match_amount_pence: number
  rollover_amount_pence: number       // carried over from previous month if no 5-match winner
  total_pool_pence: number
  subscriber_count: number
  published_at: string | null
  created_at: string
}

/**
 * A user's entry into a specific draw.
 * submitted_numbers = the user's 5 score values used as their lottery picks.
 */
export interface DrawEntry {
  id: string
  draw_id: string
  user_id: string
  submitted_numbers: number[] | null  // 5 score values; null until entry is finalised
  match_count: number
  is_winner: boolean
  created_at: string
}

/** Prize winner record for a draw. Tracks verification and payout lifecycle. */
export interface Winner {
  id: string
  draw_id: string
  user_id: string
  draw_entry_id: string
  match_type: MatchType
  prize_amount_pence: number
  verification_status: VerificationStatus
  proof_url: string | null
  payout_status: PayoutStatus
  payout_at: string | null
  admin_notes: string | null
  created_at: string
}

/** Individual charity donation, from subscription portions or direct giving. */
export interface CharityDonation {
  id: string
  user_id: string
  charity_id: string
  amount_pence: number
  donation_type: DonationType
  stripe_payment_intent_id: string | null
  created_at: string
}

// ---------------------------------------------------------------------------
// Composite / joined types used across the application
// ---------------------------------------------------------------------------

/** User with their active (or null) subscription, used in dashboard & admin. */
export interface UserWithSubscription extends User {
  subscription: Subscription | null
}

/** Draw enriched with all its entries and winners, used in admin draw view. */
export interface DrawWithEntries extends Draw {
  entries: DrawEntry[]
  winners: Winner[]
}

/** Winner record enriched with user details and draw context, used in winners table. */
export interface WinnerWithDetails extends Winner {
  user: Pick<User, 'id' | 'full_name' | 'email'>
  draw: Pick<Draw, 'id' | 'draw_month' | 'winning_numbers'>
}

/** Score enriched with the submitting user's details, used in admin scores view. */
export interface ScoreWithUser extends Score {
  user: Pick<User, 'id' | 'full_name' | 'email'>
}

// ---------------------------------------------------------------------------
// Utility types for API payloads
// ---------------------------------------------------------------------------

/** Payload accepted by the POST /api/scores endpoint. */
export interface CreateScorePayload {
  score_value: number   // must be 1–45
  score_date: string    // "YYYY-MM-DD"
}

/** Payload accepted by the POST /api/charity endpoint to update selection. */
export interface UpdateCharitySelectionPayload {
  charity_id: string
  contribution_percentage: number  // 10–100
}

/** Return type of the calculate_prize_pool() Postgres function. */
export interface PrizePoolCalculation {
  jackpot: number
  four_match: number
  three_match: number
  total: number
}

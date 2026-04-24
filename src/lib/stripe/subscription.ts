/**
 * Subscription helper functions — server-side only.
 * All DB reads use supabaseAdmin (service role) for reliability.
 * Import Subscription type from @/types/database.
 */
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Subscription, SubscriptionStatus } from '@/types/database'

// ── getUserSubscription ───────────────────────────────────────────────────────

/**
 * Fetches the subscription row for a given user ID.
 * Returns null if no subscription exists or on DB error.
 */
export async function getUserSubscription(
  userId: string
): Promise<Subscription | null> {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null

  return data as Subscription
}

// ── isSubscriptionActive ──────────────────────────────────────────────────────

/**
 * Returns true only when:
 *   1. subscription exists
 *   2. status === 'active'
 *   3. current_period_end is in the future
 *
 * This guards against stale 'active' rows where the period has silently expired
 * without a webhook firing (e.g. during local dev / webhook downtime).
 */
export function isSubscriptionActive(subscription: Subscription | null): boolean {
  if (!subscription) return false
  if (subscription.status !== 'active') return false
  if (!subscription.current_period_end) return false

  const periodEnd = new Date(subscription.current_period_end)
  return periodEnd > new Date()
}

// ── getSubscriptionStatusLabel ────────────────────────────────────────────────

/**
 * Returns a human-readable label for a subscription status, suitable for
 * display in the UI (e.g. badges, account settings page).
 */
export function getSubscriptionStatusLabel(status: SubscriptionStatus): string {
  const labels: Record<SubscriptionStatus, string> = {
    active: 'Active',
    lapsed: 'Payment Failed',
    cancelled: 'Cancelled',
    inactive: 'No Subscription',
  }
  return labels[status]
}

// ── getDaysUntilRenewal ───────────────────────────────────────────────────────

/**
 * Calculates days remaining until the subscription renews.
 * Returns null if the subscription is not active or has no period end date.
 * Returns 0 if the renewal date has already passed (should not occur for active
 * subscriptions but handled defensively).
 */
export function getDaysUntilRenewal(subscription: Subscription): number | null {
  if (!isSubscriptionActive(subscription)) return null
  if (!subscription.current_period_end) return null

  const now = new Date()
  const periodEnd = new Date(subscription.current_period_end)
  const diffMs = periodEnd.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  return Math.max(0, diffDays)
}

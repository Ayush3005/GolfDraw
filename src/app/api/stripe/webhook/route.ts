/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Stripe Webhook Handler
 *
 * IMPORTANT: This route reads the raw request body via request.text() —
 * do NOT parse as JSON first (Stripe signature verification requires raw bytes).
 *
 * All DB writes use supabaseAdmin (service role) — never the anon client.
 *
 * Events handled:
 *   checkout.session.completed     → create/upsert subscription record
 *   invoice.payment_succeeded      → renew period, set status active
 *   invoice.payment_failed         → set status lapsed
 *   customer.subscription.updated  → sync status + period end
 *   customer.subscription.deleted  → set status cancelled
 */
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripeServer } from '@/lib/stripe/client'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { SubscriptionPlan, SubscriptionStatus } from '@/types/database'

// Map Stripe subscription statuses → our SubscriptionStatus enum
const STRIPE_STATUS_MAP: Record<string, SubscriptionStatus> = {
  active: 'active',
  past_due: 'lapsed',
  canceled: 'cancelled',
  unpaid: 'lapsed',
  incomplete: 'inactive',
  incomplete_expired: 'inactive',
  trialing: 'active',
  paused: 'lapsed',
}

const AMOUNT_PENCE: Record<SubscriptionPlan, number> = {
  monthly: 1999,
  yearly: 19999,
}

// Force dynamic so Next.js never caches this route
export const dynamic = 'force-dynamic'

/** Convert Unix epoch seconds → ISO string */
function toIso(unix: number | undefined | null): string | null {
  if (!unix || isNaN(unix)) return null
  try {
    return new Date(unix * 1000).toISOString()
  } catch {
    return null
  }
}

// ── Main POST handler ─────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  const stripe = getStripeServer()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  // Read raw body — must NOT call request.json()
  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 400 }
    )
  }

  // Dispatch — errors are caught per-event so one bad event cannot crash others
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(
          stripe,
          event.data.object as Stripe.Checkout.Session
        )
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      default:
        // Unhandled event type — acknowledge silently
        break
    }
  } catch (err) {
    // Log but return 200 so Stripe does not retry indefinitely
    console.error(`[webhook] Error handling event ${event.type} (${event.id}):`, err)
  }

  return NextResponse.json({ received: true }, { status: 200 })
}

// ── Event handlers ────────────────────────────────────────────────────────────

/**
 * checkout.session.completed
 * Fires when the customer completes Stripe Checkout. Upserts the subscription
 * row using user_id from session metadata as the conflict target.
 */
async function handleCheckoutSessionCompleted(
  stripe: Stripe,
  session: Stripe.Checkout.Session
): Promise<void> {
  const userId = session.metadata?.user_id
  const plan = session.metadata?.plan as SubscriptionPlan | undefined

  if (!userId || !plan) {
    console.error(
      '[webhook] checkout.session.completed: missing metadata',
      session.metadata
    )
    return
  }

  if (!session.subscription) {
    console.error(
      '[webhook] checkout.session.completed: no subscription on session',
      session.id
    )
    return
  }

  const stripeSubId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription.id

  // Retrieve the full subscription object to get period dates
  const stripeSub = await stripe.subscriptions.retrieve(stripeSubId)

  const stripeCustomerId =
    typeof session.customer === 'string'
      ? session.customer
      : (session.customer?.id ?? '')



  const { error } = await supabaseAdmin.from('subscriptions').upsert(
    {
      user_id: userId,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSub.id,
      plan,
      status: 'active' as SubscriptionStatus,
      current_period_start: toIso((stripeSub as any).current_period_start),
      current_period_end: toIso((stripeSub as any).current_period_end),
      amount_pence: AMOUNT_PENCE[plan] ?? 1999,
    },
    { onConflict: 'stripe_customer_id' }
  )

  if (error) {
    console.error('[webhook] checkout.session.completed: DB upsert failed', error)
    throw error
  } else {

  }
}

/**
 * invoice.payment_succeeded
 * Fires on every successful payment (initial + renewals).
 * Updates the billing period and resets status to 'active'.
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  const stripeSubscriptionId =
    typeof (invoice as any).subscription === 'string'
      ? (invoice as any).subscription
      : (invoice as any).subscription?.id


  if (!stripeSubscriptionId) return // one-off invoice, not subscription-related

  const period = invoice.lines?.data?.[0]?.period
  const updateData: Record<string, unknown> = { status: 'active' }
  if (period?.start) updateData.current_period_start = toIso(period.start)
  if (period?.end) updateData.current_period_end = toIso(period.end)

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update(updateData)
    .eq('stripe_subscription_id', stripeSubscriptionId)

  if (error) {
    console.error('[webhook] invoice.payment_succeeded: DB update failed', error)
    throw error
  }
}

/**
 * invoice.payment_failed
 * Sets status to 'lapsed' so the SubscriptionGate blocks access
 * until the customer resolves their payment.
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const stripeSubscriptionId =
    typeof (invoice as any).subscription === 'string'
      ? (invoice as any).subscription
      : (invoice as any).subscription?.id


  if (!stripeSubscriptionId) return

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'lapsed' } satisfies { status: SubscriptionStatus })
    .eq('stripe_subscription_id', stripeSubscriptionId)

  if (error) {
    console.error('[webhook] invoice.payment_failed: DB update failed', error)
    throw error
  }
}

/**
 * customer.subscription.updated
 * Fires on plan changes, scheduled cancellations, reactivations, etc.
 * Syncs mapped status and billing period.
 */
async function handleSubscriptionUpdated(
  stripeSub: Stripe.Subscription
): Promise<void> {
  const mappedStatus: SubscriptionStatus =
    STRIPE_STATUS_MAP[stripeSub.status] ?? 'inactive'

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({
      status: mappedStatus,
      current_period_start: toIso((stripeSub as any).current_period_start),
      current_period_end: toIso((stripeSub as any).current_period_end),
    })

    .eq('stripe_subscription_id', stripeSub.id)

  if (error) {
    console.error(
      '[webhook] customer.subscription.updated: DB update failed',
      error
    )
    throw error
  }
}

/**
 * customer.subscription.deleted
 * Fires when a subscription reaches its cancellation date.
 */
async function handleSubscriptionDeleted(
  stripeSub: Stripe.Subscription
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'cancelled' } satisfies { status: SubscriptionStatus })
    .eq('stripe_subscription_id', stripeSub.id)

  if (error) {
    console.error(
      '[webhook] customer.subscription.deleted: DB update failed',
      error
    )
    throw error
  }
}

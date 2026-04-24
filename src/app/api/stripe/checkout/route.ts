import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { getStripeServer } from '@/lib/stripe/client'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { SubscriptionPlan } from '@/types/database'

const PRICE_IDS: Record<SubscriptionPlan, string> = {
  monthly: process.env.STRIPE_MONTHLY_PRICE_ID!,
  yearly: process.env.STRIPE_YEARLY_PRICE_ID!,
}

const AMOUNT_PENCE: Record<SubscriptionPlan, number> = {
  monthly: 1999,
  yearly: 19999,
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── Auth guard ──────────────────────────────────────────────────────────────
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // ── Parse + validate body ───────────────────────────────────────────────────
  let body: { plan?: unknown }
  try {
    body = (await request.json()) as { plan?: unknown }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const plan = body.plan as SubscriptionPlan
  if (plan !== 'monthly' && plan !== 'yearly') {
    return NextResponse.json(
      { error: 'plan must be "monthly" or "yearly"' },
      { status: 400 }
    )
  }

  const priceId = PRICE_IDS[plan]

  
  if (!priceId || priceId.startsWith('price_placeholder')) {
    return NextResponse.json(
      { error: 'Stripe price ID not configured. Run stripe/setup.ts first.' },
      { status: 500 }
    )
  }

  // ── Resolve user from our own users table ───────────────────────────────────
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('id, email, full_name')
    .eq('email', session.user.email)
    .single()

  if (userError || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // ── Get or create Stripe customer ───────────────────────────────────────────
  const stripe = getStripeServer()

  const { data: subscription, error: subError } = await supabaseAdmin
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (subError) {
    console.error('[stripe/checkout] Subscription lookup error:', subError)
  }

  let stripeCustomerId: string | null = subscription?.stripe_customer_id || null

  // Verify the customer exists in Stripe, otherwise create a new one
  if (stripeCustomerId) {
    try {
      await stripe.customers.retrieve(stripeCustomerId)
    } catch (err: any) {
      if (err.statusCode === 404) {
        console.warn(`[stripe/checkout] Customer ${stripeCustomerId} not found in Stripe. Creating fresh one.`)
        stripeCustomerId = null
      } else {
        throw err
      }
    }
  }

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.full_name,
      metadata: { user_id: user.id },
    })
    stripeCustomerId = customer.id
  }

  // ── Create Checkout Session ─────────────────────────────────────────────────
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard?subscribed=true`,
      cancel_url: `${appUrl}/pricing`,
      metadata: {
        user_id: user.id,
        plan,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
        },
      },
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: checkoutSession.url }, { status: 200 })
  } catch (err: any) {
    console.error('[stripe/checkout] Failed to create checkout session:', err.message || err)
    if (err.raw) console.error('[stripe/checkout] Stripe error details:', err.raw)
    
    return NextResponse.json(
      { error: `Failed to create checkout session: ${err.message || 'Unknown error'}` },
      { status: 500 }
    )
  }
}

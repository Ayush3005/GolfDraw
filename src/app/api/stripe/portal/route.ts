import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { getStripeServer } from '@/lib/stripe/client'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(_request: NextRequest): Promise<NextResponse> {
  // ── Auth guard ──────────────────────────────────────────────────────────────
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // ── Resolve user ────────────────────────────────────────────────────────────
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', session.user.email)
    .single()

  if (userError || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // ── Look up stripe_customer_id ──────────────────────────────────────────────
  const { data: subscription, error: subError } = await supabaseAdmin
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (subError || !subscription?.stripe_customer_id) {
    return NextResponse.json(
      { error: 'No subscription found' },
      { status: 400 }
    )
  }

  // ── Create billing portal session ───────────────────────────────────────────
  const stripe = getStripeServer()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${appUrl}/dashboard`,
    })

    return NextResponse.json({ url: portalSession.url }, { status: 200 })
  } catch (err) {
    console.error('[stripe/portal] Failed to create portal session:', err)
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    )
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { getStripeServer } from '@/lib/stripe/client'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(_request: NextRequest): Promise<NextResponse> {
  // ── Auth guard ──────────────────────────────────────────────────────────────
  const session = await auth()
  if (!session?.user?.email) {
    const url = new URL('/login', _request.url)
    return NextResponse.redirect(url)
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
    // If no subscription, redirect to pricing
    const url = new URL('/pricing', _request.url)
    return NextResponse.redirect(url)
  }

  // ── Create billing portal session ───────────────────────────────────────────
  const stripe = getStripeServer()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${appUrl}/dashboard`,
    })

    return NextResponse.redirect(portalSession.url)
  } catch (err: any) {
    console.error('[stripe/portal] Failed to create portal session:', err.message || err)
    
    // Check if it's the common "No default Customer Portal configuration" error
    if (err.message?.includes('Customer Portal configuration')) {
      return NextResponse.json(
        { error: 'Stripe Customer Portal is not configured. Please enable it in your Stripe Dashboard (Test Mode -> Settings -> Billing -> Customer Portal).' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: `Failed to create billing portal session: ${err.message || 'Unknown error'}` },
      { status: 500 }
    )
  }
}

export async function POST(_request: NextRequest): Promise<NextResponse> {
  // Keep POST for backward compatibility if needed by frontend fetch
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', session.user.email)
    .single()

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!subscription?.stripe_customer_id) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 400 })
  }

  const stripe = getStripeServer()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${appUrl}/dashboard`,
    })

    return NextResponse.json({ url: portalSession.url }, { status: 200 })
  } catch (err: any) {
    console.error('[stripe/portal] POST Failed to create portal session:', err.message || err)
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 })
  }
}

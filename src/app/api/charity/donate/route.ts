import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { getStripeServer } from "@/lib/stripe/client"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check for active subscription
  const { data: subscription, error: subError } = await supabaseAdmin
    .from("subscriptions")
    .select("status")
    .eq("user_id", session.user.id)
    .eq("status", "active")
    .single()

  if (subError || !subscription) {
    return NextResponse.json({ error: "Active subscription required to donate" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { charity_id, amount_pence, donation_type } = body

    if (!charity_id || !amount_pence || !donation_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (amount_pence < 100) {
      return NextResponse.json({ error: "Minimum donation is £1.00" }, { status: 400 })
    }

    const stripe = getStripeServer()

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount_pence,
      currency: 'gbp',
      metadata: {
        user_id: session.user.id,
        charity_id,
        donation_type
      }
    })

    // Insert pending donation record
    const { error: insertError } = await supabaseAdmin
      .from("charity_donations")
      .insert({
        user_id: session.user.id,
        charity_id,
        amount_pence,
        donation_type,
        stripe_payment_intent_id: paymentIntent.id
      })

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ client_secret: paymentIntent.client_secret })
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

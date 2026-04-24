import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  // Fetch user details
  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", id)
    .single()

  if (userError || !user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Fetch subscription
  const { data: subscription } = await supabaseAdmin
    .from("subscriptions")
    .select("*")
    .eq("user_id", id)
    .single()

  // Fetch scores (last 5)
  const { data: scores } = await supabaseAdmin
    .from("scores")
    .select("*")
    .eq("user_id", id)
    .order("score_date", { ascending: false })
    .limit(5)

  // Fetch charity selection
  const { data: charity_selection } = await supabaseAdmin
    .from("user_charity_selections")
    .select(`
      *,
      charity:charities(*)
    `)
    .eq("user_id", id)
    .single()

  return NextResponse.json({
    user,
    subscription: subscription || null,
    scores: scores || [],
    charity_selection: charity_selection || null
  })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  try {
    const body = await req.json()
    const { role } = body

    if (!role || !['subscriber', 'admin'].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from("users")
      .update({ role })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ user: updatedUser })
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

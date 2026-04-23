import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { scoreDeleteSchema, scoreInsertSchema, scoreUpdateSchema } from "@/lib/validations/score"

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get user by email
  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("email", session.user.email)
    .single()

  if (userError || !user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Fetch all scores for user ordered by score_date DESC
  const { data: scores, error: scoresError } = await supabaseAdmin
    .from("scores")
    .select("*")
    .eq("user_id", user.id)
    .order("score_date", { ascending: false })

  if (scoresError) {
    return NextResponse.json({ error: scoresError.message }, { status: 500 })
  }

  return NextResponse.json({ scores })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get user by email
  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("email", session.user.email)
    .single()

  if (userError || !user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Check for active subscription
  const { data: subscription, error: subError } = await supabaseAdmin
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single()

  if (subError || !subscription) {
    return NextResponse.json({ error: "Active subscription required" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const validated = scoreInsertSchema.parse(body)

    // Check for duplicate date
    const { data: existingScore } = await supabaseAdmin
      .from("scores")
      .select("id")
      .eq("user_id", user.id)
      .eq("score_date", validated.score_date)
      .maybeSingle()

    if (existingScore) {
      return NextResponse.json(
        { error: "A score already exists for this date. Edit or delete it instead." },
        { status: 409 }
      )
    }

    // Insert score
    const { data: score, error: insertError } = await supabaseAdmin
      .from("scores")
      .insert({
        user_id: user.id,
        score_value: validated.score_value,
        score_date: validated.score_date,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ score }, { status: 201 })
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get user
  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("email", session.user.email)
    .single()

  if (userError || !user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  try {
    const body = await req.json()
    const validated = scoreUpdateSchema.parse(body)

    // Verify ownership
    const { data: scoreToUpdate, error: fetchError } = await supabaseAdmin
      .from("scores")
      .select("user_id")
      .eq("id", validated.id)
      .single()

    if (fetchError || scoreToUpdate.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check for duplicate date conflict (excluding current record)
    const { data: conflictingScore } = await supabaseAdmin
      .from("scores")
      .select("id")
      .eq("user_id", user.id)
      .eq("score_date", validated.score_date)
      .neq("id", validated.id)
      .maybeSingle()

    if (conflictingScore) {
      return NextResponse.json(
        { error: "A score already exists for this date." },
        { status: 409 }
      )
    }

    // Update score
    const { data: updatedScore, error: updateError } = await supabaseAdmin
      .from("scores")
      .update({
        score_value: validated.score_value,
        score_date: validated.score_date,
      })
      .eq("id", validated.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ score: updatedScore })
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get user
  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("email", session.user.email)
    .single()

  if (userError || !user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  try {
    const body = await req.json()
    const validated = scoreDeleteSchema.parse(body)

    // Verify ownership
    const { data: scoreToDelete, error: fetchError } = await supabaseAdmin
      .from("scores")
      .select("user_id")
      .eq("id", validated.id)
      .single()

    if (fetchError || scoreToDelete.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete score
    const { error: deleteError } = await supabaseAdmin
      .from("scores")
      .delete()
      .eq("id", validated.id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { z } from "zod"

const drawCreateSchema = z.object({
  draw_month: z.string(), // YYYY-MM-DD
  mode: z.enum(["random", "weighted"]),
})

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Fetch all published draws ordered by draw_month DESC
  const { data: draws, error } = await supabaseAdmin
    .from("draws")
    .select(`
      *,
      winners:winners(count)
    `)
    .eq("status", "published")
    .order("draw_month", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ draws })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  
  // Verify admin role
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("email", session.user.email)
    .single()

  if (user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const validated = drawCreateSchema.parse(body)

    // Check if draw already exists for this month
    const { data: existingDraw } = await supabaseAdmin
      .from("draws")
      .select("id")
      .eq("draw_month", validated.draw_month)
      .maybeSingle()

    if (existingDraw) {
      return NextResponse.json({ error: "Draw already exists for this month" }, { status: 409 })
    }

    // Create new draw
    // Note: calculate_prize_pool is a Postgres function that should handle the pool calculation
    // We'll call it via rpc if it exists, or just insert and let trigger handle it
    const { data: newDraw, error: insertError } = await supabaseAdmin
      .from("draws")
      .insert({
        draw_month: validated.draw_month,
        draw_mode: validated.mode,
        status: "pending",
        total_pool_pence: 0, // Placeholder
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Optional: Manually trigger prize pool calculation if rpc available
    await supabaseAdmin.rpc("calculate_prize_pool", { draw_id: newDraw.id })

    return NextResponse.json({ draw: newDraw }, { status: 201 })
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

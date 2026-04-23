import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { runDrawSimulation } from "@/lib/draw/engine"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  
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
    const { data: draw } = await supabaseAdmin
      .from("draws")
      .select("draw_mode")
      .eq("id", id)
      .single()

    if (!draw) {
      return NextResponse.json({ error: "Draw not found" }, { status: 404 })
    }

    const simulationResult = await runDrawSimulation(id, draw.draw_mode)

    // Save simulation result temporarily
    await supabaseAdmin
      .from("draws")
      .update({
        winning_numbers: simulationResult.winningNumbers,
        status: "simulated",
      })
      .eq("id", id)

    return NextResponse.json(simulationResult)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Simulation failed" }, { status: 500 })
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { supabaseAdmin } from "@/lib/supabase/admin"

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
    const { verification_status, payout_status, admin_notes } = body

    const updateData: any = {}
    if (verification_status) updateData.verification_status = verification_status
    if (payout_status) {
      updateData.payout_status = payout_status
      if (payout_status === 'paid') {
        updateData.payout_at = new Date().toISOString()
      }
    }
    if (admin_notes !== undefined) updateData.admin_notes = admin_notes

    const { data: updatedWinner, error: updateError } = await supabaseAdmin
      .from("winners")
      .update(updateData)
      .eq("id", id)
      .select(`
        *,
        user:users(id, full_name, email),
        draw:draws(id, draw_month, winning_numbers)
      `)
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ winner: updatedWinner })
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

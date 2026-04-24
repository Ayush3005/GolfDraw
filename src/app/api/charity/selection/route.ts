/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { charitySelectionSchema } from "@/lib/validations/charity"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: selection, error } = await supabaseAdmin
    .from("user_charity_selections")
    .select(`
      *,
      charity:charities(*)
    `)
    .eq("user_id", session.user.id)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 is code for 'no rows returned'
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ selection: selection || null })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: any
  try {
    body = await req.json()
    const validated = charitySelectionSchema.parse(body)

    const { data: selection, error: upsertError } = await supabaseAdmin
      .from("user_charity_selections")
      .upsert({
        user_id: session.user.id,
        charity_id: validated.charity_id,
        contribution_percentage: validated.contribution_percentage,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select(`
        *,
        charity:charities(*)
      `)
      .single()

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 })
    }

    return NextResponse.json({ selection })
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === 'ZodError') {
        return NextResponse.json({ 
          error: "Validation failed", 
          details: (err as any).errors,
          received: typeof body !== 'undefined' ? body : "Body not parsed",
          message: err.message
        }, { status: 400 })
      }
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

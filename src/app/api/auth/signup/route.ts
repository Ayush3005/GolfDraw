import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { supabaseAdmin } from "@/lib/supabase/admin"

const signupSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = signupSchema.parse(body)

    // Check if email already exists in auth_accounts table
    const { data: existingAccount } = await supabaseAdmin
      .from("auth_accounts")
      .select("id")
      .eq("email", validatedData.email)
      .maybeSingle()

    if (existingAccount) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      )
    }

    // Hash password with bcrypt (saltRounds: 12)
    const passwordHash = await bcrypt.hash(validatedData.password, 12)

    // Insert into users table
    const { data: newUser, error: userError } = await supabaseAdmin
      .from("users")
      .insert({
        email: validatedData.email,
        full_name: validatedData.full_name,
        role: "subscriber",
      })
      .select()
      .single()

    if (userError) {
      throw userError
    }

    // Insert into auth_accounts
    const { error: accountError } = await supabaseAdmin
      .from("auth_accounts")
      .insert({
        user_id: newUser.id,
        email: validatedData.email,
        password_hash: passwordHash,
      })

    if (accountError) {
      // Rollback user creation if account creation fails
      await supabaseAdmin.from("users").delete().eq("id", newUser.id)
      throw accountError
    }

    return NextResponse.json(
      { success: true, message: "Account created" },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

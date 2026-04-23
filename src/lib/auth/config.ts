import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { supabaseAdmin } from "@/lib/supabase/admin"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // 2. Fetch user from Supabase users table by email
        const { data: user, error: userError } = await supabaseAdmin
          .from("users")
          .select("*")
          .eq("email", credentials.email)
          .single()

        if (userError || !user) {
          return null
        }

        // 3. Fetch password hash from a separate auth_accounts table
        const { data: account, error: accountError } = await supabaseAdmin
          .from("auth_accounts")
          .select("password_hash")
          .eq("user_id", user.id)
          .single()

        if (accountError || !account) {
          return null
        }

        // 4. Compare with bcrypt.compare
        const isPasswordCorrect = await bcrypt.compare(
          credentials.password as string,
          account.password_hash
        )

        if (!isPasswordCorrect) {
          return null
        }

        // 5. Return user object
        return {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
        token.role = user.role
        token.full_name = user.full_name
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.full_name = token.full_name as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
})

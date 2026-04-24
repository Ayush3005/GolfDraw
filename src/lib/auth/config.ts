/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const email = (credentials.email as string).trim().toLowerCase();
          const password = credentials.password as string;

          // 1. Fetch auth_accounts first by email
          const { data: authAccount, error: authError } = await supabaseAdmin
            .from("auth_accounts")
            .select("user_id, password_hash")
            .eq("email", email)
            .maybeSingle();

          if (authError || !authAccount) {
            return null;
          }

          // 2. Verify password hash
          try {
            const isPasswordCorrect = await bcrypt.compare(password, authAccount.password_hash);
            if (!isPasswordCorrect) return null;
          } catch (bcryptErr) {
            return null;
          }

          // 3. Fetch user profile
          const { data: user, error: userError } = await supabaseAdmin
            .from("users")
            .select("id, email, full_name, role")
            .eq("id", authAccount.user_id)
            .maybeSingle();

          if (userError || !user) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
          };
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = user.role;
        token.full_name = user.full_name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.full_name = token.full_name as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allow relative URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // Allow same origin
      if (url.startsWith(baseUrl)) return url
      return baseUrl
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
});

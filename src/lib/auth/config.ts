/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase/admin";

console.log("[CONFIG] Auth config loading... supabaseAdmin:", !!supabaseAdmin);

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
          console.log("[AUTH] authorize() called with email:", credentials?.email);
          
          if (!credentials?.email || !credentials?.password) {
            console.error("[AUTH] Missing email or password");
            return null;
          }

          const email = (credentials.email as string).trim().toLowerCase();
          const password = credentials.password as string;

          console.log("[AUTH] Normalized email:", email);

          // 1. Fetch auth_accounts first by email
          const { data: authAccount, error: authError } = await supabaseAdmin
            .from("auth_accounts")
            .select("user_id, password_hash")
            .eq("email", email)
            .single();

          console.log("[AUTH] auth_accounts query:", {
            error: authError?.message,
            hasAccount: !!authAccount,
            email: email,
          });

          if (authError) {
          const errorMsg = String(authError).toLowerCase();
          if (errorMsg.includes('malware') || errorMsg.includes('cisco') || errorMsg.includes('block')) {
            console.error("[AUTH] NETWORK BLOCKED: Supabase domain is blocked by firewall/ISP");
            console.error("[AUTH] Try: use VPN, different network, or contact network admin");
          } else {
            console.error("[AUTH] Auth account query failed:", authError);
          }
          }

          if (!authAccount) {
            console.error("[AUTH] No auth account found for email:", email);
            return null;
          }

          // 2. Verify password hash
          console.log("[AUTH] Password hash exists, comparing...");
          
          try {
            const isPasswordCorrect = await bcrypt.compare(password, authAccount.password_hash);
            
            if (!isPasswordCorrect) {
              console.error("[AUTH] Password mismatch for:", email);
              return null;
            }
          } catch (bcryptErr) {
            console.error("[AUTH] bcrypt.compare failed:", (bcryptErr as Error).message);
            return null;
          }

          // 3. Fetch user profile
          const { data: user, error: userError } = await supabaseAdmin
            .from("users")
            .select("id, email, full_name, role")
            .eq("id", authAccount.user_id)
            .single();

          console.log("[AUTH] user profile query:", {
            error: userError?.message,
            hasUser: !!user,
            userId: authAccount.user_id,
          });

          if (userError) {
            console.error("[AUTH] User profile query failed:", userError.message, userError.code);
            return null;
          }

          if (!user) {
            console.error("[AUTH] User profile not found for ID:", authAccount.user_id);
            return null;
          }

          console.log("[AUTH] Authorization successful:", user.id);

          return {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
          };
        } catch (error) {
          console.error("[AUTH] FATAL ERROR in authorize():", error instanceof Error ? error.message : String(error));
          console.error("[AUTH] Full error:", error);
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
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
});

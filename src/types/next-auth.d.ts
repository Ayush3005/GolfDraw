import { DefaultSession, DefaultJWT } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id?: string
      role?: string
      full_name?: string
    } & DefaultSession["user"]
  }
  interface User {
    role?: string
    full_name?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string
    role?: string
    full_name?: string
  }
}

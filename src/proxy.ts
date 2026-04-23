import { auth } from "@/lib/auth/config"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session?.user

  const isAuthPage =
    nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/signup")
  const isUserPage =
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/scores") ||
    nextUrl.pathname.startsWith("/charity")
  const isAdminPage = nextUrl.pathname.startsWith("/admin")

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }
  if (isUserPage && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }
  if (isAdminPage && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }
  if (isAdminPage && session?.user?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     *   - _next/static  (static files)
     *   - _next/image   (image optimisation)
     *   - favicon.ico
     *   - public assets (png, jpg, svg, etc.)
     *   - API routes (/api/*) - NextAuth v5 auth wrapper handles its own api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|otf|css|js)$).*)",
  ],
}

import { auth } from '@/lib/auth/config'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth?.user
  const role = req.auth?.user?.role
  const isAdmin = role === 'admin'

  const isAuthPage = nextUrl.pathname.startsWith('/login') ||
                     nextUrl.pathname.startsWith('/signup')
  const isUserPage = nextUrl.pathname.startsWith('/dashboard') ||
                     nextUrl.pathname.startsWith('/scores') ||
                     nextUrl.pathname.startsWith('/charity') ||
                     nextUrl.pathname.startsWith('/wins') ||
                     nextUrl.pathname.startsWith('/settings')
  const isAdminPage = nextUrl.pathname.startsWith('/admin')

  // If on auth page and already logged in → redirect to correct home
  if (isAuthPage && isLoggedIn) {
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin', nextUrl))
    }
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  // If on user page and not logged in → login
  if (isUserPage && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  // If on admin page and not logged in → login
  if (isAdminPage && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  // If on admin page but not admin role → redirect to user dashboard
  if (isAdminPage && !isAdmin) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}

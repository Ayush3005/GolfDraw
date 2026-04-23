"use client"
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import SignOutButton from '@/components/auth/SignOutButton'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold tracking-tight hover:opacity-80 transition-opacity">
          Golf<span className="text-primary">Draw</span>
        </Link>

        <div className="flex items-center gap-4">
          {session?.user ? (
            <>
              <span className="text-sm text-muted-foreground hidden lg:block max-w-[200px] truncate">
                {session.user.email}
              </span>
              <div className="flex items-center gap-2">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">Dashboard</Button>
                </Link>
                <Link href="/scores">
                  <Button variant="ghost" size="sm">Scores</Button>
                </Link>
                {session.user.role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">Admin</Button>
                  </Link>
                )}
                <div className="ml-2 pl-2 border-l border-border">
                  <SignOutButton variant="outline" />
                </div>
              </div>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

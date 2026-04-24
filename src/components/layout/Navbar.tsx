"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import SignOutButton from "@/components/auth/SignOutButton"
import { MobileNav } from "./MobileNav"
import DashboardLink from "@/components/shared/DashboardLink"

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="h-20 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <Link href="/" className="text-2xl font-black tracking-tight text-foreground hover:opacity-80 transition-opacity">
          Golf<span className="text-primary">Draw</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" className="font-bold text-muted-foreground hover:text-foreground" asChild>
            <Link href="/#how-it-works">How It Works</Link>
          </Button>
          <Button variant="ghost" className="font-bold text-muted-foreground hover:text-foreground" asChild>
            <Link href="/pricing">Pricing</Link>
          </Button>
          
          <div className="w-px h-6 bg-border mx-4" />

          {session?.user ? (
            <div className="flex items-center gap-3">
              <DashboardLink />
              <SignOutButton variant="ghost" className="font-bold" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="font-bold">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button className="rounded-full px-8 font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden">
          <MobileNav session={session} />
        </div>
      </div>
    </nav>
  )
}

/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, LayoutDashboard, LogOut, Home, Info, CreditCard, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"

interface MobileNavProps {
  session: any
}

export function MobileNav({ session }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  // Prevent background scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/#how-it-works", label: "How It Works", icon: Info },
    { href: "/pricing", label: "Pricing", icon: CreditCard },
    { href: "/faq", label: "FAQ", icon: HelpCircle },
  ]

  const menuContent = (
    <div 
      className={cn(
        "fixed inset-0 z-[100] bg-background flex flex-col transition-all duration-300 ease-in-out",
        isOpen 
          ? "opacity-100 pointer-events-auto translate-y-0" 
          : "opacity-0 pointer-events-none -translate-y-4"
      )}
    >
      <div className="flex flex-col h-full p-6 overflow-y-auto">
        {/* Header inside the full-screen menu */}
        <div className="flex justify-between items-center mb-12">
          <Link href="/" onClick={closeMenu} className="text-2xl font-black tracking-tight text-foreground">
            Golf<span className="text-primary">Draw</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={closeMenu} className="text-foreground hover:bg-muted rounded-full">
            <X className="h-8 w-8" />
          </Button>
        </div>

        {/* Main Links */}
        <nav className="flex flex-col space-y-4 flex-grow px-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (pathname === '/' && link.href === '/#how-it-works' && false)
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={cn(
                  "flex items-center gap-6 p-4 rounded-2xl text-2xl font-black transition-all",
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <link.icon className="h-8 w-8" />
                {link.label}
              </Link>
            )
          })}

          {session && (
            <>
              <div className="h-px bg-border my-6" />
              <Link
                href="/dashboard"
                onClick={closeMenu}
                className="flex items-center gap-6 p-4 rounded-2xl text-2xl font-black text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
              >
                <LayoutDashboard className="h-8 w-8" />
                Dashboard
              </Link>
              <button
                onClick={() => {
                  closeMenu()
                  signOut()
                }}
                className="flex items-center gap-6 p-4 rounded-2xl text-2xl font-black text-destructive hover:bg-destructive/10 transition-all w-full text-left"
              >
                <LogOut className="h-8 w-8" />
                Sign Out
              </button>
            </>
          )}
        </nav>

        {/* Auth Buttons */}
        {!session && (
          <div className="grid grid-cols-1 gap-4 pt-8 mt-auto pb-8">
            <Button variant="outline" className="rounded-2xl h-16 text-xl font-black w-full border-border text-foreground hover:bg-muted" asChild onClick={closeMenu}>
              <Link href="/login">Log In</Link>
            </Button>
            <Button className="rounded-2xl h-16 text-xl font-black w-full bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20" asChild onClick={closeMenu}>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="md:hidden">
      <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Toggle Menu" className="text-foreground">
        <Menu className="h-6 w-6" />
      </Button>
      {mounted && createPortal(menuContent, document.body)}
    </div>
  )
}

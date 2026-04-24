"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Flag, Heart, Trophy } from "lucide-react"

const MOBILE_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/scores", label: "Scores", icon: Flag },
  { href: "/charity", label: "Charity", icon: Heart },
  { href: "/wins", label: "Wins", icon: Trophy },
]

export function BottomTabBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-card border-t border-border flex items-center justify-around px-2 z-50 md:hidden safe-area-bottom">
      {MOBILE_LINKS.map((link) => {
        const isActive = pathname === link.href
        return (
          <Link key={link.href} href={link.href} className="flex-1 max-w-[80px]">
            <div
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <link.icon size={24} strokeWidth={isActive ? 3 : 2} />
              <span className="text-[10px] font-black uppercase tracking-widest">{link.label}</span>
              {isActive && <div className="w-1 h-1 bg-primary rounded-full mt-0.5" />}
            </div>
          </Link>
        )
      })}
    </nav>
  )
}

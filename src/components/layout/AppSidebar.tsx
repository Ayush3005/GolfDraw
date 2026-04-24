"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Flag,
  Heart,
  Trophy,
  Settings,
  LayoutDashboard,
  Users,
  Ticket,
  BarChart3,
} from "lucide-react";

const USER_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/scores", label: "My Scores", icon: Flag },
  { href: "/charity", label: "Charity", icon: Heart },
  { href: "/wins", label: "My Wins", icon: Trophy },
  { href: "/settings", label: "Settings", icon: Settings },
];

const ADMIN_LINKS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/draws", label: "Draws", icon: Ticket },
  { href: "/admin/charities", label: "Charities", icon: Heart },
  { href: "/admin/winners", label: "Winners", icon: Trophy },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

interface AppSidebarProps {
  variant: "user" | "admin";
  user?: {
    email: string;
    name?: string;
  };
}

export function AppSidebar({ variant, user }: AppSidebarProps) {
  const pathname = usePathname();
  const links = variant === "user" ? USER_LINKS : ADMIN_LINKS;

  return (
    <aside
      className={cn(
        "fixed left-0 h-[calc(100vh-80px)] w-[240px] bg-card border-r border-border hidden md:flex flex-col z-40",
        variant === "user" ? "top-20" : "top-0 h-screen",
      )}
    >
      {/* Nav Links */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto pt-6">
        {variant === "admin" && (
          <div className="px-4 py-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Admin Panel
            </p>
          </div>
        )}
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all group relative",
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                )}
                <link.icon
                  size={20}
                  className={cn(
                    "transition-colors",
                    isActive ? "text-white" : "group-hover:text-primary",
                  )}
                />
                <span>{link.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 mt-auto border-t border-border bg-muted/30">
        {user && (
          <div className="flex items-center gap-3 px-4 py-3 mb-2 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black shrink-0">
              {user.email[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black truncate text-foreground">
                {user.name || user.email.split("@")[0]}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

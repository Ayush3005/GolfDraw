"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarItem {
  name: string;
  href: string;
  icon: string;
}

const userItems: SidebarItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "My Scores", href: "/scores", icon: "📈" },
  { name: "Charity", href: "/charity", icon: "❤️" },
];

const adminItems: SidebarItem[] = [
  { name: "Overview", href: "/admin", icon: "📊" },
  { name: "Users", href: "/admin/users", icon: "👥" },
  { name: "Draws", href: "/admin/draws", icon: "🎰" },
  { name: "Charities", href: "/admin/charities", icon: "❤️" },
  { name: "Winners", href: "/admin/winners", icon: "🏆" },
];

export function Sidebar(): React.ReactElement {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const items = isAdmin ? adminItems : userItems;

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 p-6">
      <div className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-green-100 text-green-900"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <span>{item.icon} </span>
            {item.name}
          </Link>
        ))}
      </div>
    </aside>
  );
}

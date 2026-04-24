import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  className?: string
}

const statusMap: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  inactive: { label: "Inactive", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  lapsed: { label: "Lapsed", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  approved: { label: "Approved", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  paid: { label: "Paid", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  published: { label: "Published", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = (status || "unknown").toLowerCase()
  const config = statusMap[normalizedStatus] || { label: status || "Unknown", color: "bg-muted text-muted-foreground" }
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "px-3 py-1 rounded-full border-none font-bold text-xs uppercase tracking-wider shadow-none",
        config.color,
        className
      )}
    >
      {config.label}
    </Badge>
  )
}

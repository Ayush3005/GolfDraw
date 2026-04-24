import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  change?: {
    value: string | number
    type: "increase" | "decrease"
  }
  icon?: LucideIcon
  className?: string
}

export function StatCard({ label, value, change, icon: Icon, className }: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden border-border bg-card", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          {Icon && (
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Icon size={20} />
            </div>
          )}
        </div>
        
        <div className="mt-3 flex items-baseline gap-3">
          <h3 className="text-3xl font-black tracking-tight text-foreground">{value}</h3>
          {change && (
            <span
              className={cn(
                "text-xs font-black px-2 py-1 rounded-full",
                change.type === "increase"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              )}
            >
              {change.type === "increase" ? "+" : ""}
              {change.value}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

import { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    href: string
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-16 text-center bg-card rounded-[40px] border-2 border-dashed border-border transition-all duration-500 hover:border-primary/30 group">
      <div className="w-24 h-24 bg-muted rounded-[32px] flex items-center justify-center text-muted-foreground mb-8 group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500">
        <Icon size={48} className="transition-transform group-hover:rotate-12" />
      </div>
      <h3 className="text-3xl font-black text-foreground mb-3 tracking-tight">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-10 text-lg font-medium leading-relaxed">
        {description}
      </p>
      {action && (
        <Button asChild className="rounded-2xl h-14 px-10 font-black text-lg bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-transform hover:scale-105">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  )
}

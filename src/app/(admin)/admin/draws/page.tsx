import { auth } from "@/lib/auth/config"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatCard } from "@/components/shared/StatCard"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Ticket, 
  Plus, 
  Calendar,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  PlayCircle
} from "lucide-react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/EmptyState"

export default async function AdminDrawsPage() {
  const session = await auth()

  const { data: draws } = await supabaseAdmin
    .from("draws")
    .select("*")
    .order("draw_month", { ascending: false })

  const { count: pendingDraws } = await supabaseAdmin.from("draws").select("*", { count: "exact", head: true }).eq("status", "pending")
  const { count: totalDraws } = await supabaseAdmin.from("draws").select("*", { count: "exact", head: true })

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Draw Management" 
        subtitle="Schedule and manage monthly prize draws."
        action={
          <Button className="rounded-full font-bold bg-primary hover:bg-primary/90 text-white gap-2">
            <Plus size={18} /> Create New Draw
          </Button>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Draws" value={totalDraws || 0} icon={Ticket} />
        <StatCard label="Pending" value={pendingDraws || 0} icon={Calendar} />
        <StatCard label="Published" value={(totalDraws || 0) - (pendingDraws || 0)} icon={CheckCircle} />
        <StatCard label="Next Draw" value="31 Jul" icon={PlayCircle} />
      </div>

      {/* Main Table */}
      <Card className="border-border bg-card overflow-hidden">
        <CardContent className="p-0">
          {draws && draws.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border bg-muted/30">
                  <TableHead className="font-bold text-muted-foreground py-4 pl-6">Draw Month</TableHead>
                  <TableHead className="font-bold text-muted-foreground py-4">Status</TableHead>
                  <TableHead className="font-bold text-muted-foreground py-4">Winning Numbers</TableHead>
                  <TableHead className="font-bold text-muted-foreground py-4 text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {draws.map((draw) => (
                  <TableRow key={draw.id} className="border-border hover:bg-muted/50 transition-colors">
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                          <Calendar size={18} />
                        </div>
                        <div className="font-bold text-foreground">
                          {new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(new Date(draw.draw_month))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={draw.status} />
                    </TableCell>
                    <TableCell>
                      {draw.winning_numbers ? (
                        <div className="flex gap-1">
                          {draw.winning_numbers.map((num: number, i: number) => (
                            <div key={i} className="w-7 h-7 rounded-md bg-muted text-foreground flex items-center justify-center text-xs font-black border border-border">
                              {num}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-muted-foreground italic">Not yet drawn</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        {draw.status === 'pending' && (
                          <Button variant="outline" size="sm" className="rounded-full font-bold border-primary text-primary hover:bg-primary hover:text-white">
                            Execute Draw
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground">
                          <MoreVertical size={18} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState 
              icon={Ticket}
              title="No draws scheduled"
              description="Create your first draw to start managing prize outcomes."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

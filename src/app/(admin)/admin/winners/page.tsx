import { auth } from "@/lib/auth/config"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatCard } from "@/components/shared/StatCard"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Trophy, 
  Download, 
  Search, 
  Filter, 
  MoreVertical,
  CheckCircle,
  Clock,
  CircleDollarSign
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
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/shared/EmptyState"

export default async function AdminWinnersPage() {
  const session = await auth()

  const { data: winners } = await supabaseAdmin
    .from("winners")
    .select("*, draws(*), users(*)")
    .order("created_at", { ascending: false })

  const { count: pendingPayouts } = await supabaseAdmin.from("winners").select("*", { count: "exact", head: true }).eq("status", "pending")

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Winners & Payouts" 
        subtitle="Verify and process prize distributions."
        action={
          <Button variant="outline" className="rounded-full font-bold border-border gap-2">
            <Download size={18} /> Export CSV
          </Button>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Winners" value={winners?.length || 0} icon={Trophy} />
        <StatCard label="Pending Payouts" value={pendingPayouts || 0} icon={Clock} />
        <StatCard label="Total Paid" value="£8,450" icon={CircleDollarSign} />
        <StatCard label="Approval Rate" value="98%" icon={CheckCircle} />
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Search by winner name or email..." 
            className="pl-12 h-12 rounded-xl border-border bg-card font-medium"
          />
        </div>
        <Button variant="outline" className="h-12 rounded-xl border-border gap-2 font-bold px-6">
          <Filter size={18} /> Filter Status
        </Button>
      </div>

      {/* Main Table */}
      <Card className="border-border bg-card overflow-hidden">
        <CardContent className="p-0">
          {winners && winners.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border bg-muted/30">
                  <TableHead className="font-bold text-muted-foreground py-4 pl-6">Winner</TableHead>
                  <TableHead className="font-bold text-muted-foreground py-4">Draw</TableHead>
                  <TableHead className="font-bold text-muted-foreground py-4">Prize Amount</TableHead>
                  <TableHead className="font-bold text-muted-foreground py-4">Status</TableHead>
                  <TableHead className="font-bold text-muted-foreground py-4 text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {winners.map((winner) => (
                  <TableRow key={winner.id} className="border-border hover:bg-muted/50 transition-colors">
                    <TableCell className="py-4 pl-6">
                      <div className="font-bold text-foreground">{winner.users?.full_name || "Unknown"}</div>
                      <div className="text-xs text-muted-foreground font-medium">{winner.users?.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-bold text-foreground">
                        {winner.draws ? new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(new Date(winner.draws.draw_month)) : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="font-black text-foreground">
                      £{(winner.prize_amount / 100).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={winner.status} />
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        {winner.status === 'pending' && (
                          <Button size="sm" className="rounded-full font-bold bg-blue-600 hover:bg-blue-700 text-white">
                            Process Payout
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
              icon={Trophy}
              title="No winners yet"
              description="Winning records will appear here after draws are executed and processed."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

import { auth } from "@/lib/auth/config"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatCard } from "@/components/shared/StatCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  Ticket, 
  Heart, 
  TrendingUp, 
  Clock,
  ArrowUpRight
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
import Link from "next/link"

export default async function AdminOverviewPage() {
  const session = await auth()

  // Fetch Stats
  const { count: totalUsers } = await supabaseAdmin.from("users").select("*", { count: "exact", head: true })
  const { count: activeSubs } = await supabaseAdmin.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active")
  const { count: pendingDraws } = await supabaseAdmin.from("draws").select("*", { count: "exact", head: true }).eq("status", "pending")
  const { count: totalWinners } = await supabaseAdmin.from("winners").select("*", { count: "exact", head: true })

  // Fetch recent users
  const { data: recentUsers } = await supabaseAdmin
    .from("users")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  // Fetch recent draws
  const { data: recentDraws } = await supabaseAdmin
    .from("draws")
    .select("*")
    .order("draw_month", { ascending: false })
    .limit(5)

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Dashboard Overview" 
        subtitle="Platform health and recent activity at a glance."
        action={
          <Link href="/admin/draws">
            <Button className="rounded-full font-bold bg-primary hover:bg-primary/90 text-white gap-2 shadow-lg shadow-primary/20">
              <Ticket size={18} /> New Draw
            </Button>
          </Link>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Users" 
          value={totalUsers || 0} 
          icon={Users} 
          change={{ value: "12%", type: "increase" }}
        />
        <StatCard 
          label="Active Subs" 
          value={activeSubs || 0} 
          icon={TrendingUp} 
          change={{ value: "8%", type: "increase" }}
        />
        <StatCard 
          label="Pending Draws" 
          value={pendingDraws || 0} 
          icon={Clock} 
        />
        <StatCard 
          label="Charity Giving" 
          value="£2,450" 
          icon={Heart} 
          change={{ value: "24%", type: "increase" }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users Table */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">Recent Signups</CardTitle>
            <Link href="/admin/users">
              <Button variant="ghost" size="sm" className="text-primary font-bold gap-1">
                View All <ArrowUpRight size={14} />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="font-bold text-muted-foreground">User</TableHead>
                  <TableHead className="font-bold text-muted-foreground">Role</TableHead>
                  <TableHead className="font-bold text-muted-foreground text-right">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers?.map((user) => (
                  <TableRow key={user.id} className="border-border hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="font-bold text-foreground">{user.full_name || user.email.split('@')[0]}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={user.role} />
                    </TableCell>
                    <TableCell className="text-right text-xs font-medium text-muted-foreground">
                      {new Intl.DateTimeFormat('en-GB').format(new Date(user.created_at))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Draws Table */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">Recent Draws</CardTitle>
            <Link href="/admin/draws">
              <Button variant="ghost" size="sm" className="text-primary font-bold gap-1">
                Manage Draws <ArrowUpRight size={14} />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="font-bold text-muted-foreground">Draw Month</TableHead>
                  <TableHead className="font-bold text-muted-foreground">Status</TableHead>
                  <TableHead className="font-bold text-muted-foreground text-right">Pool</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentDraws?.map((draw) => (
                  <TableRow key={draw.id} className="border-border hover:bg-muted/50 transition-colors">
                    <TableCell className="font-bold text-foreground">
                      {new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(new Date(draw.draw_month))}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={draw.status} />
                    </TableCell>
                    <TableCell className="text-right font-black text-foreground">
                      £4,995
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

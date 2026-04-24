import { auth } from "@/lib/auth/config"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatCard } from "@/components/shared/StatCard"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreVertical,
  ShieldCheck,
  Ban
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

export default async function AdminUsersPage() {
  const session = await auth()

  const { data: users } = await supabaseAdmin
    .from("users")
    .select("*")
    .order("created_at", { ascending: false })

  const { count: totalUsers } = await supabaseAdmin.from("users").select("*", { count: "exact", head: true })
  const { count: adminUsers } = await supabaseAdmin.from("users").select("*", { count: "exact", head: true }).eq("role", "admin")

  return (
    <div className="space-y-8">
      <PageHeader 
        title="User Management" 
        subtitle="Manage platform users, roles, and permissions."
        action={
          <Button className="rounded-full font-bold bg-primary hover:bg-primary/90 text-white gap-2">
            <UserPlus size={18} /> Invite User
          </Button>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Users" value={totalUsers || 0} icon={Users} />
        <StatCard label="Administrators" value={adminUsers || 0} icon={ShieldCheck} />
        <StatCard label="Banned" value={0} icon={Ban} />
        <StatCard label="Growth" value="+12%" icon={Users} />
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Search users by name or email..." 
            className="pl-12 h-12 rounded-xl border-border bg-card font-medium"
          />
        </div>
        <Button variant="outline" className="h-12 rounded-xl border-border gap-2 font-bold px-6">
          <Filter size={18} /> Filter
        </Button>
      </div>

      {/* Main Table */}
      <Card className="border-border bg-card overflow-hidden">
        <CardContent className="p-0">
          {users && users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border bg-muted/30">
                  <TableHead className="font-bold text-muted-foreground py-4 pl-6">User Details</TableHead>
                  <TableHead className="font-bold text-muted-foreground py-4">Role</TableHead>
                  <TableHead className="font-bold text-muted-foreground py-4">Joined Date</TableHead>
                  <TableHead className="font-bold text-muted-foreground py-4 text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="border-border hover:bg-muted/50 transition-colors">
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black shrink-0">
                          {user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-foreground">{user.full_name || "New User"}</div>
                          <div className="text-xs text-muted-foreground font-medium">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={user.role} />
                    </TableCell>
                    <TableCell className="text-sm font-medium text-muted-foreground">
                      {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(user.created_at))}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
                        <MoreVertical size={18} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState 
              icon={Users}
              title="No users found"
              description="Your user database is currently empty or no users match your search."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreVertical,
  ShieldCheck,
  Ban,
  Eye,
  Shield,
  Trash2,
  Mail
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatCard } from "@/components/shared/StatCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { EmptyState } from "@/components/shared/EmptyState"
import { UserDetailSheet } from "./UserDetailSheet"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { toast } from "sonner"

interface UsersClientProps {
  initialUsers: any[]
  totalCount: number
  adminCount: number
}

export function UsersClient({ initialUsers, totalCount, adminCount }: UsersClientProps) {
  const router = useRouter()
  const [users, setUsers] = useState(initialUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  // Sync with server data
  useEffect(() => {
    setUsers(initialUsers)
  }, [initialUsers])

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
                         (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    const matchesRole = !roleFilter || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const openUserDetail = (userId: string) => {
    setSelectedUserId(userId)
    setIsSheetOpen(true)
  }

  const handleInviteUser = () => {
    toast.info("Invite User functionality coming soon!")
  }

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'subscriber' : 'admin'
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })
      if (res.ok) {
        toast.success(`User updated to ${newRole}`)
        router.refresh()
      } else {
        toast.error("Failed to update user role")
      }
    } catch (err) {
      toast.error("An error occurred")
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="User Management" 
        subtitle="Manage platform users, roles, and permissions."
        action={
          <Button 
            onClick={handleInviteUser}
            className="rounded-full font-bold bg-primary hover:bg-primary/90 text-white gap-2"
          >
            <UserPlus size={18} /> Invite User
          </Button>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Users" value={totalCount} icon={Users} />
        <StatCard label="Administrators" value={adminCount} icon={ShieldCheck} />
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(
            buttonVariants({ variant: "outline" }),
            "h-12 rounded-xl border-border gap-2 font-bold px-6"
          )}>
            <Filter size={18} /> {roleFilter ? (roleFilter === 'admin' ? 'Admins Only' : 'Subscribers Only') : 'All Roles'}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl font-bold">
            <DropdownMenuItem onClick={() => setRoleFilter(null)}>All Roles</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRoleFilter('admin')}>Admins Only</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRoleFilter('subscriber')}>Subscribers Only</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Table */}
      <Card className="border-border bg-card overflow-hidden">
        <CardContent className="p-0">
          {filteredUsers.length > 0 ? (
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
                {filteredUsers.map((user) => (
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
                      <DropdownMenu>
                        <DropdownMenuTrigger className={cn(
                          buttonVariants({ variant: "ghost", size: "icon" }),
                          "rounded-full text-muted-foreground hover:text-foreground"
                        )}>
                          <MoreVertical size={18} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-xl font-bold">
                          <DropdownMenuItem onClick={() => openUserDetail(user.id)} className="gap-2">
                            <Eye size={16} /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.location.href = `mailto:${user.email}`} className="gap-2">
                            <Mail size={16} /> Send Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => toggleRole(user.id, user.role)}
                            className="gap-2"
                          >
                            <Shield size={16} /> 
                            {user.role === 'admin' ? 'Demote to Subscriber' : 'Promote to Admin'}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive gap-2">
                            <Trash2 size={16} /> Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState 
              icon={Users}
              title="No users found"
              description={searchTerm ? "No users match your search criteria." : "Your user database is currently empty."}
            />
          )}
        </CardContent>
      </Card>

      <UserDetailSheet 
        userId={selectedUserId}
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </div>
  )
}

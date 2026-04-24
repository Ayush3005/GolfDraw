import { auth } from "@/lib/auth/config"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { UsersClient } from "@/components/admin/UsersClient"

export default async function AdminUsersPage() {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return null
  }

  const { data: users } = await supabaseAdmin
    .from("users")
    .select("*")
    .order("created_at", { ascending: false })

  const { count: totalUsers } = await supabaseAdmin
    .from("users")
    .select("*", { count: "exact", head: true })
    
  const { count: adminUsers } = await supabaseAdmin
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin")

  return (
    <UsersClient 
      initialUsers={users || []}
      totalCount={totalUsers || 0}
      adminCount={adminUsers || 0}
    />
  )
}

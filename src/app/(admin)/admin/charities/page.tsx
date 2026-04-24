import { auth } from "@/lib/auth/config"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { CharitiesClient } from "@/components/admin/CharitiesClient"

export default async function AdminCharitiesPage() {
  // Authentication check
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return null // Middleware handles redirect
  }

  // Fetch charities data
  const { data: charities } = await supabaseAdmin
    .from("charities")
    .select("*")
    .order("name", { ascending: true })

  // Fetch summary counts
  const { count: activeCount } = await supabaseAdmin
    .from("charities")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)

  const { count: featuredCount } = await supabaseAdmin
    .from("charities")
    .select("*", { count: "exact", head: true })
    .eq("is_featured", true)

  return (
    <CharitiesClient 
      initialCharities={charities || []}
      activeCount={activeCount || 0}
      featuredCount={featuredCount || 0}
    />
  )
}

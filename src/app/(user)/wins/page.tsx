import { auth } from "@/lib/auth/config"
import { redirect } from "next/navigation"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Trophy } from "lucide-react"
import { UserWinsClient } from "@/components/user/UserWinsClient"

export default async function WinsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  
  const email = session.user.email || ""

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("email", email)
    .single()

  if (!user) redirect("/login")

  // Fetch user's winning records
  const { data: wins } = await supabaseAdmin
    .from("winners")
    .select("*, draws(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-8">
      <PageHeader 
        title="My Wins" 
        subtitle="View your prize history and payout status."
      />

      {wins && wins.length > 0 ? (
        <UserWinsClient initialWins={wins} />
      ) : (
        <EmptyState 
          icon={Trophy}
          title="No wins yet"
          description="Keep entering your scores! Every month is a new chance to win big while supporting charity."
          action={{ label: "Enter More Scores", href: "/scores" }}
        />
      )}
    </div>
  )
}

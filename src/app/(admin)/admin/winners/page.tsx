import { auth } from "@/lib/auth/config"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { WinnersClient } from "@/components/admin/WinnersClient"

export default async function AdminWinnersPage() {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return null
  }

  // Fetch all winners with related draw and user data
  const { data: winners } = await supabaseAdmin
    .from("winners")
    .select("*, draws(draw_month), users(full_name, email)")
    .order("created_at", { ascending: false })

  // Calculate pending payouts (verification approved but unpaid)
  const { count: pendingPayouts } = await supabaseAdmin
    .from("winners")
    .select("*", { count: "exact", head: true })
    .eq("verification_status", "approved")
    .eq("payout_status", "unpaid")

  // Calculate total amount paid out
  const { data: paidWinners } = await supabaseAdmin
    .from("winners")
    .select("prize_amount_pence")
    .eq("payout_status", "paid")

  const totalPaidPence = paidWinners?.reduce((sum, w) => sum + (w.prize_amount_pence || 0), 0) || 0

  return (
    <WinnersClient 
      initialWinners={winners || []}
      pendingCount={pendingPayouts || 0}
      totalPaidPence={totalPaidPence}
    />
  )
}

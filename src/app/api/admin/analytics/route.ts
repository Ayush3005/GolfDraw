/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  const session = await auth()
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    // 1. Total Users
    const { count: totalUsers } = await supabaseAdmin
      .from("users")
      .select("*", { count: 'exact', head: true })

    // 2. Active Subscribers
    const { count: activeSubscribers } = await supabaseAdmin
      .from("subscriptions")
      .select("*", { count: 'exact', head: true })
      .eq("status", "active")

    // 3. Revenue (Monthly/Yearly)
    const { data: activeSubs } = await supabaseAdmin
      .from("subscriptions")
      .select("amount_pence, plan")
      .eq("status", "active")

    let monthlyRevenue = 0
    let yearlyRevenue = 0

    activeSubs?.forEach(sub => {
      if (sub.plan === 'monthly') {
        monthlyRevenue += sub.amount_pence
      } else if (sub.plan === 'yearly') {
        yearlyRevenue += sub.amount_pence
      }
    })

    // Approximate monthly revenue from yearly subs
    const estimatedMonthlyRevenue = monthlyRevenue + (yearlyRevenue / 12)

    // 4. Charity Donations
    const { data: donations } = await supabaseAdmin
      .from("charity_donations")
      .select("amount_pence, charity:charities(name)")

    const totalCharityDonations = donations?.reduce((sum, d) => sum + d.amount_pence, 0) || 0

    const charityBreakdownMap: Record<string, number> = {}
    donations?.forEach(d => {
      const name = (d.charity as any)?.name || 'Unknown'
      charityBreakdownMap[name] = (charityBreakdownMap[name] || 0) + d.amount_pence
    })

    const charityBreakdown = Object.entries(charityBreakdownMap).map(([charityName, totalPence]) => ({
      charityName,
      totalPence
    }))

    // 5. Draw Stats
    const { count: totalDraws } = await supabaseAdmin
      .from("draws")
      .select("*", { count: 'exact', head: true })

    const { count: totalWinners } = await supabaseAdmin
      .from("winners")
      .select("*", { count: 'exact', head: true })

    const { data: paidWinners } = await supabaseAdmin
      .from("winners")
      .select("prize_amount_pence")
      .eq("payout_status", "paid")

    const totalPaidOut = paidWinners?.reduce((sum, w) => sum + w.prize_amount_pence, 0) || 0

    const { count: jackpotRollovers } = await supabaseAdmin
      .from("draws")
      .select("*", { count: 'exact', head: true })
      .gt("rollover_amount_pence", 0)

    // 6. Recent Signups (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count: recentSignups } = await supabaseAdmin
      .from("users")
      .select("*", { count: 'exact', head: true })
      .gte("created_at", thirtyDaysAgo.toISOString())

    // 7. Score Stats
    const { data: scores } = await supabaseAdmin
      .from("scores")
      .select("score_value")

    const totalScoresEntered = scores?.length || 0
    const averageScore = totalScoresEntered > 0 
      ? scores!.reduce((sum, s) => sum + s.score_value, 0) / totalScoresEntered 
      : 0

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      activeSubscribers: activeSubscribers || 0,
      monthlyRevenue: Math.round(estimatedMonthlyRevenue),
      yearlyRevenue: yearlyRevenue,
      totalCharityDonations,
      charityBreakdown,
      drawStats: {
        totalDraws: totalDraws || 0,
        totalWinners: totalWinners || 0,
        totalPaidOut,
        jackpotRollovers: jackpotRollovers || 0
      },
      recentSignups: recentSignups || 0,
      scoreStats: {
        averageScore: parseFloat(averageScore.toFixed(1)),
        totalScoresEntered
      }
    })
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

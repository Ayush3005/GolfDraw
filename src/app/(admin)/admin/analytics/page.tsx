import { auth } from "@/lib/auth/config"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatCard } from "@/components/shared/StatCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CircleDollarSign, 
  Heart, 
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  Target
} from "lucide-react"
import { cn } from "@/lib/utils"

export default async function AdminAnalyticsPage() {
  const session = await auth()
  
  // Aggregate stats from database
  const { count: totalUsers } = await supabaseAdmin.from("users").select("*", { count: "exact", head: true })
  const { count: totalDraws } = await supabaseAdmin.from("draws").select("*", { count: "exact", head: true })
  const { data: paidWinners } = await supabaseAdmin.from("winners").select("prize_amount_pence").eq("payout_status", "paid")
  const { data: totalSubscriptions } = await supabaseAdmin.from("subscriptions").select("amount_pence").eq("status", "active")

  const totalPrizePaid = paidWinners?.reduce((sum, w) => sum + (w.prize_amount_pence || 0), 0) || 0
  const monthlyRevenue = totalSubscriptions?.reduce((sum, s) => sum + (s.amount_pence || 0), 0) || 0

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="Analytics & Insights" 
        subtitle="Deep dive into platform performance, revenue, and user engagement."
      />

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Revenue" 
          value={`£${(monthlyRevenue / 100).toLocaleString()}`} 
          icon={CircleDollarSign} 
          trend={{ value: "+12.5%", isPositive: true }}
        />
        <StatCard 
          label="Active Users" 
          value={totalUsers || 0} 
          icon={Users} 
          trend={{ value: "+3.2%", isPositive: true }}
        />
        <StatCard 
          label="Charity Impact" 
          value={`£${((monthlyRevenue * 0.2) / 100).toLocaleString()}`} 
          icon={Heart} 
          trend={{ value: "+18%", isPositive: true }}
        />
        <StatCard 
          label="Prizes Awarded" 
          value={`£${(totalPrizePaid / 100).toLocaleString()}`} 
          icon={Trophy} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart (CSS Based) */}
        <Card className="lg:col-span-2 border-border bg-card rounded-3xl overflow-hidden group transition-all hover:shadow-2xl hover:shadow-primary/5">
          <CardHeader className="p-8 border-b border-border bg-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black tracking-tight">Revenue Forecast</CardTitle>
                <p className="text-sm font-bold text-muted-foreground mt-1">Projected monthly growth based on current subscriptions.</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-black">
                <TrendingUp size={14} /> ON TRACK
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[300px] w-full flex items-end gap-3 sm:gap-6 pt-10">
              {[45, 62, 58, 75, 85, 72, 95].map((val, i) => (
                <div key={i} className="flex-1 h-full flex flex-col group/bar">
                  <div className="relative w-full flex-1 flex items-end">
                    <div 
                      className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-black opacity-0 group-hover/bar:opacity-100 transition-opacity bg-foreground text-background px-3 py-1 rounded-full whitespace-nowrap z-10 shadow-xl"
                    >
                      £{(val * 100).toLocaleString()}
                    </div>
                    <div 
                      className="w-full bg-primary/10 rounded-t-2xl transition-all duration-500 group-hover/bar:bg-primary/20 relative"
                      style={{ height: `${val}%` }}
                    >
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-2xl transition-all duration-700 delay-100 shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                        style={{ height: i === 6 ? '100%' : '40%' }}
                      />
                    </div>
                  </div>
                  <div className="h-10 flex items-center justify-center">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][i]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Growth Insights */}
        <Card className="border-border bg-card rounded-3xl overflow-hidden transition-all hover:shadow-2xl hover:shadow-primary/5 flex flex-col">
          <CardHeader className="p-8 border-b border-border bg-muted/20">
            <CardTitle className="text-xl font-black tracking-tight">Growth Insights</CardTitle>
          </CardHeader>
          <CardContent className="p-8 flex-1 flex flex-col justify-between gap-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Target size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-foreground">Conversion Rate</p>
                    <p className="text-xs font-bold text-muted-foreground">Visits to Subs</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-foreground">3.2%</p>
                  <p className="text-[10px] font-black text-green-500 flex items-center justify-end">
                    <ArrowUpRight size={10} /> +0.4%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-foreground">Retention</p>
                    <p className="text-xs font-bold text-muted-foreground">Monthly active</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-foreground">94%</p>
                  <p className="text-[10px] font-black text-red-500 flex items-center justify-end">
                    <ArrowDownRight size={10} /> -1.2%
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
              <p className="text-xs font-black text-primary uppercase tracking-widest mb-2">Smart Insight</p>
              <p className="text-sm font-bold text-foreground leading-relaxed">
                Charity engagement is up 18% this month. Users who select a featured charity are 2.4x more likely to maintain their subscription.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-border bg-card rounded-3xl overflow-hidden transition-all hover:shadow-2xl hover:shadow-primary/5">
          <CardHeader className="p-8 border-b border-border">
            <CardTitle className="text-lg font-black tracking-tight">Prize Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {[
              { label: "Jackpot (5 Match)", value: 2, color: "bg-yellow-500" },
              { label: "Tier 2 (4 Match)", value: 18, color: "bg-slate-400" },
              { label: "Tier 3 (3 Match)", value: 145, color: "bg-orange-500" },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="text-foreground">{item.value} Winners</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-1000", item.color)} 
                    style={{ width: `${(item.value / 165) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border bg-card rounded-3xl overflow-hidden transition-all hover:shadow-2xl hover:shadow-primary/5">
          <CardHeader className="p-8 border-b border-border">
            <CardTitle className="text-lg font-black tracking-tight">User Acquisition</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {[
              { label: "Referral", value: 45, color: "bg-primary" },
              { label: "Social Media", value: 30, color: "bg-blue-400" },
              { label: "Direct Search", value: 25, color: "bg-indigo-500" },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="text-foreground">{item.value}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-1000", item.color)} 
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

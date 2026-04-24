import { auth } from "@/lib/auth/config"
import { redirect } from "next/navigation"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Heart, Trophy, Flag, ArrowRight, Plus, Calendar, Target } from "lucide-react"
import Link from "next/link"
import { EmptyState } from "@/components/shared/EmptyState"
import { cn } from "@/lib/utils"

export default async function DashboardPage() {
  const session = await auth()
  const email = session?.user?.email || ""

  // Fetch user data
  const { data: user } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("email", email)
    .single()

  if (!user) redirect("/login")

  // Fetch subscription — subscriptions table has no charity_id column;
  // charity selection is stored separately in user_charity_selections
  const { data: subscription, error: subError } = await supabaseAdmin
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

  if (subError) console.error('[dashboard] subscription fetch error:', subError)

  // Fetch charity selection from the new selections table
  const { data: selection } = await supabaseAdmin
    .from("user_charity_selections")
    .select(`
      *,
      charity:charities(*)
    `)
    .eq("user_id", user.id)
    .maybeSingle()

  // Fetch latest scores
  const { data: scores } = await supabaseAdmin
    .from("scores")
    .select("*")
    .eq("user_id", user.id)
    .order("score_date", { ascending: false })
    .limit(5)

  // Fetch next draw
  const { data: nextDraw } = await supabaseAdmin
    .from("draws")
    .select("*")
    .eq("status", "pending")
    .order("draw_month", { ascending: true })
    .limit(1)
    .maybeSingle()

  // Fetch last draw result
  const { data: lastDraw } = await supabaseAdmin
    .from("draws")
    .select("*")
    .eq("status", "published")
    .order("draw_month", { ascending: false })
    .limit(1)
    .maybeSingle()

  const isActive = subscription?.status === "active"
  const currentCharity = selection?.charity || subscription?.charities

  return (
    <div className="space-y-10 pb-20">
      <PageHeader 
        title={`Welcome back, ${user.full_name || user.email.split('@')[0]}`}
        subtitle="Your golf impact, scores, and monthly draw entries."
        action={
          <Link href="/api/stripe/portal">
            <Button variant="outline" className="rounded-2xl h-12 font-black border-border gap-2 hover:bg-muted">
              <CreditCard size={18} /> Billing Portal
            </Button>
          </Link>
        }
      />

      {/* Top Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Subscription Status */}
        <Card className="border-border bg-card rounded-[40px] shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden group">
          <CardHeader className="pb-4 pt-8 px-8">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-black tracking-tight">Subscription</CardTitle>
              <StatusBadge status={subscription?.status || "inactive"} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            <div className="p-6 bg-muted/50 rounded-[32px] border border-border group-hover:bg-primary/5 transition-colors">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Active Plan</p>
              <p className="text-2xl font-black text-foreground mt-1 tracking-tighter">
                {subscription?.plan === 'yearly' ? 'Yearly Supporter' : 
                 subscription?.plan === 'monthly' ? 'Monthly Member' : 'None'}
              </p>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <Calendar size={14} />
                <p className="text-xs font-bold">
                  {subscription?.current_period_end 
                    ? `Next draw: ${new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(subscription.current_period_end))}`
                    : 'Upgrade to join the next draw'}
                </p>
              </div>
            </div>
            {!isActive && (
              <Link href="/pricing" className="block">
                <Button className="w-full rounded-2xl h-14 font-black bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                  Activate Membership
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Next Draw Card */}
        <Card className="border-border bg-card rounded-[40px] shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 group overflow-hidden">
          <CardHeader className="pb-4 pt-8 px-8">
            <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
              <Trophy size={20} className="text-amber-500" />
              Draw Entry
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            <div className="p-6 bg-indigo-500/5 rounded-[32px] border border-indigo-500/10 group-hover:bg-indigo-500/10 transition-colors relative">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Upcoming Pool</p>
              <p className="text-4xl font-black text-indigo-600 mt-1 tracking-tighter">£9,420</p>
              <p className="text-[10px] text-indigo-400 font-bold mt-1 uppercase tracking-widest">Jackpot Match 5</p>
              <Target size={64} className="absolute -right-4 -bottom-4 text-indigo-500/5 rotate-12" />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
              <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Entry Status</span>
              {scores?.length === 5 ? (
                <Badge className="bg-green-500 text-white border-none font-black uppercase tracking-widest text-[9px] px-3 py-1">Confirmed</Badge>
              ) : (
                <Badge className="bg-amber-500/10 text-amber-600 border-none font-black uppercase tracking-widest text-[9px] px-3 py-1">
                  {scores?.length || 0}/5 Scores
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Charity Card */}
        <Card className="border-border bg-card rounded-[40px] shadow-sm hover:shadow-xl hover:shadow-red-500/5 transition-all duration-500 group overflow-hidden">
          <CardHeader className="pb-4 pt-8 px-8">
            <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
              <Heart size={20} className="text-red-500" />
              Your Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            {currentCharity ? (
              <>
                <div className="p-6 bg-red-500/5 rounded-[32px] border border-red-500/10 group-hover:bg-red-500/10 transition-colors">
                  <p className="text-sm font-black text-foreground line-clamp-1">{currentCharity.name}</p>
                  <p className="text-xs text-muted-foreground mt-2 font-medium">
                    {selection?.contribution_percentage || 20}% contribution portion
                  </p>
                  <div className="flex items-center gap-2 mt-4">
                    <div className="h-2 flex-1 bg-red-500/10 rounded-full overflow-hidden">
                       <div className="h-full bg-red-500 w-3/4 rounded-full" />
                    </div>
                    <span className="text-sm font-black text-red-500">Top 5%</span>
                  </div>
                </div>
                <Link href="/charity">
                  <Button variant="ghost" className="w-full h-12 rounded-2xl text-sm font-black text-muted-foreground hover:text-primary gap-2 hover:bg-primary/5">
                    Manage Selection <ArrowRight size={16} />
                  </Button>
                </Link>
              </>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-red-500/5 rounded-[24px] flex items-center justify-center mx-auto">
                  <Heart size={32} className="text-red-500/40" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">No charity selected yet.</p>
                <Link href="/charity" className="block">
                  <Button className="w-full rounded-2xl h-14 font-black bg-primary text-white shadow-lg shadow-primary/20">
                    Choose Your Cause
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scores & Results Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Scores Section */}
        <div className="space-y-6 bg-card p-10 rounded-[40px] border border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-foreground tracking-tight">Entries</h2>
            <Link href="/scores">
              <Button size="sm" className="rounded-2xl h-10 px-6 font-black bg-primary text-white gap-2 shadow-lg shadow-primary/20">
                <Plus size={16} /> Add Score
              </Button>
            </Link>
          </div>
          
          {scores && scores.length > 0 ? (
            <div className="space-y-8">
              <div className="flex flex-wrap gap-4">
                {scores.map((score, i) => (
                  <div 
                    key={score.id}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-primary bg-primary/5 flex items-center justify-center text-2xl md:text-3xl font-black text-primary shadow-xl shadow-primary/5 animate-fade-in-up"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    {score.score_value}
                  </div>
                ))}
                {Array.from({ length: 5 - scores.length }).map((_, i) => (
                  <div key={`empty-${i}`} className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-dashed border-border flex items-center justify-center text-muted-foreground/20">
                    <Flag size={24} />
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground font-medium italic">
                {scores.length === 5 
                  ? "Your entry is complete for this month's draw." 
                  : `Log ${5 - scores.length} more score${5 - scores.length > 1 ? 's' : ''} to complete your entry.`}
              </p>
            </div>
          ) : (
            <EmptyState 
              icon={Flag}
              title="No scores yet"
              description="Enter your last 5 Stableford scores to enter the monthly draw."
              action={{ label: "Add Your First Score", href: "/scores" }}
            />
          )}
        </div>

        {/* Last Draw Section */}
        <div className="space-y-6 bg-card p-10 rounded-[40px] border border-border">
          <h2 className="text-2xl font-black text-foreground tracking-tight">Last Result</h2>
          {lastDraw ? (
            <div className="space-y-6">
              <div className="bg-indigo-600 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
                  {new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(new Date(lastDraw.draw_month))} Draw
                </p>
                <div className="flex gap-4 mt-6">
                  {lastDraw.winning_numbers?.map((num: number, i: number) => (
                    <div key={i} className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white text-indigo-600 flex items-center justify-center font-black text-xl shadow-xl">
                      {num}
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 bg-muted/50 rounded-3xl border border-border flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-foreground uppercase tracking-widest">Match Result</p>
                  <p className="text-xs text-muted-foreground mt-1 font-bold">Matching 3+ wins a share of the pool</p>
                </div>
                <Badge variant="outline" className="rounded-full border-2 border-border font-black px-4 py-1 text-xs">No Match</Badge>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground/30">
                <Trophy size={32} />
              </div>
              <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">First result pending</p>
              <p className="text-sm text-muted-foreground max-w-[200px] font-medium">Results will appear here after the upcoming draw.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

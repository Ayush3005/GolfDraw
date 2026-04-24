import { auth } from "@/lib/auth/config"
import { redirect } from "next/navigation"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatCard } from "@/components/shared/StatCard"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Flag, Trash2, Edit3, Info, TrendingUp, Award, Zap } from "lucide-react"
import ScoreEntryForm from "@/components/scores/ScoreEntryForm"
import { EmptyState } from "@/components/shared/EmptyState"

export default async function ScoresPage() {
  const session = await auth()
  const email = session?.user?.email || ""

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("email", email)
    .single()

  if (!user) redirect("/login")

  const { data: scores } = await supabaseAdmin
    .from("scores")
    .select("*")
    .eq("user_id", user.id)
    .order("score_date", { ascending: false })

  const scoreValues = scores?.map(s => s.score_value) || []
  const avgScore = scoreValues.length > 0 ? (scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length).toFixed(1) : 0
  const maxScore = scoreValues.length > 0 ? Math.max(...scoreValues) : 0
  const minScore = scoreValues.length > 0 ? Math.min(...scoreValues) : 0

  return (
    <div className="space-y-10">
      <PageHeader 
        title="My Scores"
        subtitle="Manage your Stableford scores and enter the monthly draw."
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Scores" value={scores?.length || 0} icon={Flag} />
        <StatCard label="Average" value={avgScore} icon={TrendingUp} />
        <StatCard label="Personal Best" value={maxScore} icon={Award} />
        <StatCard label="Consistency" value={minScore} icon={Zap} />
      </div>

      {/* Entry Form Section */}
      <Card className="border-border bg-card border-2 border-primary/20 shadow-xl shadow-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Edit3 size={20} />
            </div>
            <h2 className="text-xl font-black text-foreground">Add New Score</h2>
          </div>
          <ScoreEntryForm />
        </CardContent>
      </Card>

      {/* Scores Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-foreground">
            Your Scores <span className="text-muted-foreground ml-2 text-sm font-bold">({scores?.length || 0}/5 for draw)</span>
          </h2>
        </div>

        {scores && scores.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {scores.map((score) => (
              <Card key={score.id} className="group border-border bg-card hover:border-primary/50 transition-all hover:scale-105 duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 cursor-default relative h-[140px]">
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 size={14} />
                  </Button>
                </div>
                <CardContent className="p-0 h-full flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-primary tracking-tighter">{score.score_value}</span>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2">
                    {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(score.score_date))}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState 
            icon={Flag}
            title="No scores recorded"
            description="Start by entering your first Stableford score using the form above."
          />
        )}
      </div>

      {/* Info Banner */}
      <div className="p-6 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 flex items-start gap-4">
        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 shrink-0">
          <Info size={24} />
        </div>
        <div>
          <h3 className="font-bold text-indigo-500">Entry Requirements</h3>
          <p className="text-sm text-indigo-400/80 leading-relaxed mt-1">
            We use your **last 5 scores** submitted within the current month as your entry numbers for the monthly draw. 
            If you have fewer than 5, your entry will be incomplete. Submission is automatic once you hit 5 scores.
          </p>
        </div>
      </div>
    </div>
  )
}

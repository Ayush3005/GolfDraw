import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth/config"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { SubscriptionGate } from "@/components/shared/SubscriptionGate"
import UpcomingDrawCard from "@/components/draws/UpcomingDrawCard"
import DrawResultCard from "@/components/draws/DrawResultCard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, ExternalLink, ArrowRight, CreditCard } from "lucide-react"
import SignOutButton from "@/components/auth/SignOutButton"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")

  // Get user from DB
  const { data: user } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("email", session.user.email)
    .single()

  if (!user) redirect("/login")

  // 1. Fetch Subscription
  const { data: subscription } = await supabaseAdmin
    .from("subscriptions")
    .select("*, charities(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  const isActive = subscription?.status === "active"

  // 2. Fetch Next Pending Draw
  const { data: nextDraw } = await supabaseAdmin
    .from("draws")
    .select("*")
    .eq("status", "pending")
    .order("draw_month", { ascending: true })
    .limit(1)
    .maybeSingle()

  // 3. Fetch Last Published Draw + User Entry
  const { data: lastDraw } = await supabaseAdmin
    .from("draws")
    .select("*")
    .eq("status", "published")
    .order("draw_month", { ascending: false })
    .limit(1)
    .maybeSingle()

  let userEntry = null
  let userPrize = null

  if (lastDraw) {
    const { data: entry } = await supabaseAdmin
      .from("draw_entries")
      .select("*")
      .eq("draw_id", lastDraw.id)
      .eq("user_id", user.id)
      .maybeSingle()
    
    userEntry = entry

    const { data: prize } = await supabaseAdmin
      .from("winners")
      .select("*")
      .eq("draw_id", lastDraw.id)
      .eq("user_id", user.id)
      .maybeSingle()
    
    userPrize = prize
  }

  // 4. Fetch User's latest 5 scores
  const { data: scores } = await supabaseAdmin
    .from("scores")
    .select("score_value")
    .eq("user_id", user.id)
    .order("score_date", { ascending: false })
    .limit(5)

  const latestScores = scores || []

  return (
    <div className="container py-10 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.name || user.email.split('@')[0]}</h1>
          <p className="text-muted-foreground">Here's what's happening with your GolfDraw entries.</p>
        </div>
        <SignOutButton variant="outline" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Subscription Card */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Subscription Status</CardTitle>
                <CardDescription>Manage your plan and billing</CardDescription>
              </div>
              <Badge variant={isActive ? "default" : "destructive"} className={isActive ? "bg-green-500" : ""}>
                {isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscription ? (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Renewal Date:</span>
                  <span className="font-medium">
                    {subscription.next_billing_date ? new Intl.DateTimeFormat('en-GB').format(new Date(subscription.next_billing_date)) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monthly Contribution:</span>
                  <span className="font-medium">£{(subscription.currency_amount / 100).toFixed(2)}</span>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">You don't have an active subscription.</p>
            )}
            <Link href="/api/stripe/portal" className="block">
              <Button variant="outline" className="w-full flex gap-2">
                <CreditCard className="h-4 w-4" />
                Manage Billing
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Charity Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Your Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscription?.charities ? (
              <>
                <div className="flex items-center gap-4">
                  <div className="bg-red-50 p-3 rounded-lg">
                    <Heart className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="font-bold">{subscription.charities.name}</p>
                    <p className="text-xs text-muted-foreground">Receiving 20% of your subscription</p>
                  </div>
                </div>
                <Link href="/charity" className="block">
                  <Button variant="ghost" size="sm" className="w-full text-primary hover:text-primary hover:bg-primary/10 flex gap-2">
                    Change Charity
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-4">No charity selected yet.</p>
                <Link href="/charity">
                  <Button size="sm">Choose a Charity</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <SubscriptionGate userId={user.id}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {nextDraw && (
              <UpcomingDrawCard draw={nextDraw} userScores={latestScores} />
            )}

            {lastDraw && (
              <DrawResultCard draw={lastDraw} userEntry={userEntry} userPrize={userPrize} />
            )}
            
            {!nextDraw && !lastDraw && (
              <Card>
                <CardContent className="p-10 text-center text-muted-foreground">
                  No draws scheduled yet. Stay tuned!
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {/* Score Summary */}
            <Card>
              <CardHeader>
                <CardTitle>My Latest Entry</CardTitle>
                <CardDescription>Your newest 5 scores used for the draw</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {latestScores.map((s, i) => (
                    <Badge key={i} variant="secondary" className="text-lg py-1 px-3">
                      {s.score_value}
                    </Badge>
                  ))}
                  {latestScores.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">No scores entered yet.</p>
                  )}
                </div>
                <Link href="/scores" className="block">
                  <Button variant="outline" className="w-full flex gap-2">
                    Manage My Scores
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-sm">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2 text-muted-foreground">
                <p>• Draws run monthly</p>
                <p>• 5-match jackpot rolls over if not won</p>
                <p>• Weighted draws favor more frequent scores</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </SubscriptionGate>
    </div>
  )
}

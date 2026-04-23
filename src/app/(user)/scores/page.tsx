import { redirect } from "next/navigation"
import { auth } from "@/lib/auth/config"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { SubscriptionGate } from "@/components/shared/SubscriptionGate"
import ScoreEntryForm from "@/components/scores/ScoreEntryForm"
import ScoreList from "@/components/scores/ScoreList"
import ScoreStats from "@/components/scores/ScoreStats"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"

// Note: Using revalidate = 0 to ensure scores are fresh
export const revalidate = 0

// Force re-build
export default async function ScoresPage() {
  const session = await auth()
  if (!session?.user?.email) {
    redirect("/login")
  }

  // Get user from DB
  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("email", session.user.email)
    .single()

  if (userError || !user) {
    // This should theoretically not happen if session exists
    redirect("/login")
  }

  // Fetch current scores server-side
  const { data: scores, error: scoresError } = await supabaseAdmin
    .from("scores")
    .select("*")
    .eq("user_id", user.id)
    .order("score_date", { ascending: false })

  const initialScores = scores || []

  return (
    <div className="container max-w-4xl py-10">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Scores</h1>
        <p className="text-muted-foreground">
          Enter your Stableford scores. Your latest 5 are used as your draw entry numbers.
        </p>
      </div>

      <SubscriptionGate userId={user.id}>
        <div className="space-y-8">
          <ScoreStats scores={initialScores} />
          
          <div className="grid gap-8">
            <section>
              <h2 className="text-xl font-semibold mb-4">Recent Scores</h2>
              <ScoreList initialScores={initialScores} userId={user.id} />
            </section>

            <section className="bg-muted/30 p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Add New Entry</h2>
              <ScoreEntryForm />
              <div className="mt-4">
                <Alert variant="default" className="bg-blue-50/50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800">Note</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    You can enter up to 5 scores. Adding a 6th automatically removes your oldest.
                  </AlertDescription>
                </Alert>
              </div>
            </section>
          </div>
        </div>
      </SubscriptionGate>
    </div>
  )
}

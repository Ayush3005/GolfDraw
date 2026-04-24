import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info, Clock } from "lucide-react"

interface Score {
  score_value: number
}

interface Draw {
  draw_month: string
  total_pool_pence: number
  rollover_amount_pence: number
}

interface UpcomingDrawCardProps {
  draw: Draw
  userScores: Score[]
}

export default function UpcomingDrawCard({ draw, userScores }: UpcomingDrawCardProps) {
  const formattedMonth = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(new Date(draw.draw_month))
  const poolTotal = (draw.total_pool_pence + (draw.rollover_amount_pence || 0)) / 100
  
  // Calculate days until draw (assuming draw is on 1st of next month or end of current)
  const drawDate = new Date(draw.draw_month)
  const today = new Date()
  const diffTime = Math.abs(drawDate.getTime() - today.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-primary uppercase tracking-wider mb-1">Next Draw</p>
            <CardTitle className="text-2xl font-bold">{formattedMonth}</CardTitle>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Estimated Pool</p>
            <p className="text-2xl font-bold text-green-600">£{poolTotal.toFixed(2)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>Draw in {diffDays} days</span>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">Your current entry numbers:</p>
          <div className="flex gap-2">
            {userScores.map((score, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-lg bg-background border-2 border-primary/20 flex items-center justify-center font-bold text-primary"
              >
                {score.score_value}
              </div>
            ))}
            {userScores.length < 5 && (
              Array.from({ length: 5 - userScores.length }).map((_, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-lg bg-background border-2 border-dashed border-muted flex items-center justify-center font-bold text-muted-foreground"
                >
                  ?
                </div>
              ))
            )}
          </div>
          {userScores.length < 5 && (
            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
              <Info className="h-3 w-3" />
              <span>Add {5 - userScores.length} more score{5 - userScores.length > 1 ? 's' : ''} to strengthen your entry!</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Calendar, Coins } from "lucide-react"

interface DrawEntry {
  match_count: number
  submitted_numbers: number[]
  is_winner: boolean
}

interface Draw {
  id: string
  draw_month: string
  winning_numbers: number[]
  published_at: string
  rollover_amount_pence: number
}

interface DrawWithEntries extends Draw {
  winner_count?: number
}

interface DrawResultCardProps {
  draw: DrawWithEntries
  userEntry?: DrawEntry
  userPrize?: { prize_amount_pence: number, status: string }
}

export default function DrawResultCard({ draw, userEntry, userPrize }: DrawResultCardProps) {
  const formattedMonth = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(new Date(draw.draw_month))
  const formattedPublished = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(draw.published_at))

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Draw Results — {formattedMonth}
          </CardTitle>
          <Badge variant="outline">{formattedPublished}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Winning Numbers</p>
          <div className="flex gap-3">
            {draw.winning_numbers.map((num) => (
              <div
                key={num}
                className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold shadow-lg"
              >
                {num}
              </div>
            ))}
          </div>
        </div>

        {userEntry && (
          <div className="border rounded-lg p-4 bg-accent/30 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Your Entry:</span>
              <span className="text-sm font-bold">{userEntry.match_count} Match{userEntry.match_count !== 1 ? 'es' : ''}</span>
            </div>
            <div className="flex gap-2">
              {userEntry.submitted_numbers.map((num, i) => (
                <Badge
                  key={i}
                  variant={draw.winning_numbers.includes(num) ? "default" : "secondary"}
                  className={draw.winning_numbers.includes(num) ? "bg-green-500 hover:bg-green-600" : ""}
                >
                  {num}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {userPrize && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-4">
            <div className="bg-green-500 p-2 rounded-full">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-green-800 font-bold">You Won £{(userPrize.prize_amount_pence / 100).toFixed(2)}!</p>
              <p className="text-green-700 text-sm">Status: {userPrize.status}</p>
            </div>
          </div>
        )}

        {draw.rollover_amount_pence > 0 && !userPrize && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
            <Coins className="h-5 w-5 text-blue-600" />
            <p className="text-blue-800 text-sm font-medium">
              Jackpot rolled over to next month — pool: £{(draw.rollover_amount_pence / 100).toFixed(2)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

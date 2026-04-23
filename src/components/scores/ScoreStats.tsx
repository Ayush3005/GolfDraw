import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Score {
  id: string
  score_value: number
  score_date: string
}

interface ScoreStatsProps {
  scores: Score[]
}

export default function ScoreStats({ scores }: ScoreStatsProps) {
  if (scores.length === 0) return null

  const total = scores.length
  const sum = scores.reduce((acc, curr) => acc + curr.score_value, 0)
  const average = (sum / total).toFixed(1)
  const highest = Math.max(...scores.map((s) => s.score_value))
  const lowest = Math.min(...scores.map((s) => s.score_value))

  const stats = [
    { label: "Total Scores", value: total },
    { label: "Average Score", value: average },
    { label: "Highest Score", value: highest },
    { label: "Lowest Score", value: lowest },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

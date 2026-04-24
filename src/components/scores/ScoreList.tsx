"use client"

import { useState } from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import { Pencil, Trash2, X, Check } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { scoreUpdateSchema, type ScoreUpdate } from "@/lib/validations/score"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Score {
  id: string
  user_id: string
  score_value: number
  score_date: string
  created_at: string
}

interface ScoreListProps {
  initialScores: Score[]
  userId: string
}

export default function ScoreList({ initialScores, userId }: ScoreListProps) {
  const [scores, setScores] = useState<Score[]>(initialScores)
  const [editingId, setEditingId] = useState<string | null>(null)

  const sortedScores = [...scores].sort(
    (a, b) => new Date(b.score_date).getTime() - new Date(a.score_date).getTime()
  )

  const handleDelete = async (id: string) => {
    const previousScores = [...scores]
    setScores(scores.filter((s) => s.id !== id))

    try {
      const res = await fetch("/api/scores", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      if (!res.ok) throw new Error("Failed to delete score")
      toast.success("Score deleted")
    } catch (error) {
      setScores(previousScores)
      toast.error("Failed to delete score")
    }
  }

  const handleUpdate = async (data: ScoreUpdate) => {
    const previousScores = [...scores]
    const updatedScores = scores.map((s) =>
      s.id === data.id ? { ...s, score_value: data.score_value, score_date: data.score_date } : s
    )
    setScores(updatedScores)
    setEditingId(null)

    try {
      const res = await fetch("/api/scores", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const result = await res.json()
        throw new Error(result.error || "Failed to update score")
      }
      toast.success("Score updated")
    } catch (error) {
      setScores(previousScores)
      toast.error(error instanceof Error ? error.message : "Failed to update score")
    }
  }

  if (scores.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">No scores yet. Add your first Stableford score below.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sortedScores.map((score) => (
        <ScoreCard
          key={score.id}
          score={score}
          isEditing={editingId === score.id}
          onEdit={() => setEditingId(score.id)}
          onCancel={() => setEditingId(null)}
          onDelete={() => handleDelete(score.id)}
          onUpdate={handleUpdate}
        />
      ))}
    </div>
  )
}

function ScoreCard({
  score,
  isEditing,
  onEdit,
  onCancel,
  onDelete,
  onUpdate,
}: {
  score: Score
  isEditing: boolean
  onEdit: () => void
  onCancel: () => void
  onDelete: () => void
  onUpdate: (data: ScoreUpdate) => Promise<void>
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ScoreUpdate>({
    resolver: zodResolver(scoreUpdateSchema),
    defaultValues: {
      id: score.id,
      score_value: score.score_value,
      score_date: score.score_date.split("T")[0],
    },
  })

  if (isEditing) {
    return (
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onUpdate)} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1 w-full space-y-1">
              <Input
                type="number"
                {...register("score_value", { valueAsNumber: true })}
                className="w-full"
              />
              {errors.score_value && (
                <p className="text-xs text-destructive">{errors.score_value.message}</p>
              )}
            </div>
            <div className="flex-1 w-full space-y-1">
              <Input type="date" {...register("score_date")} className="w-full" />
              {errors.score_date && (
                <p className="text-xs text-destructive">{errors.score_date.message}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="icon" variant="ghost">
                <Check className="h-4 w-4 text-green-500" />
              </Button>
              <Button type="button" size="icon" variant="ghost" onClick={onCancel}>
                <X className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center justify-center bg-primary/10 rounded-full w-16 h-16">
            <span className="text-2xl font-bold text-primary">{score.score_value}</span>
            <span className="text-[10px] uppercase font-medium text-primary/70">Points</span>
          </div>
          <div>
            <p className="font-semibold text-lg">Stableford Score</p>
            <p className="text-sm text-muted-foreground">
              {new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(new Date(score.score_date))}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your score for this date.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}

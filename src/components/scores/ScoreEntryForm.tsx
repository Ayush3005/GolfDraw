"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { scoreInsertSchema, type ScoreInsert } from "@/lib/validations/score"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ScoreEntryForm() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ScoreInsert>({
    resolver: zodResolver(scoreInsertSchema),
    defaultValues: {
      score_value: 0,
      score_date: new Date().toISOString().split("T")[0],
    },
  })

  const onSubmit = async (data: ScoreInsert) => {
    setLoading(true)
    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || "Failed to add score")
      }

      toast.success("Score added!")
      reset()
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Score</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="score_value">Stableford Score (1-45)</Label>
            <Input
              id="score_value"
              type="number"
              {...register("score_value", { valueAsNumber: true })}
              placeholder="e.g. 36"
              disabled={loading}
            />
            {errors.score_value && (
              <p className="text-sm text-destructive">{errors.score_value.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="score_date">Date of Round</Label>
            <Input
              id="score_date"
              type="date"
              max={new Date().toISOString().split("T")[0]}
              {...register("score_date")}
              disabled={loading}
            />
            {errors.score_date && (
              <p className="text-sm text-destructive">{errors.score_date.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding..." : "Add Score"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

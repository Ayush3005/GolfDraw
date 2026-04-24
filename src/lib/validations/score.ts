import { z } from "zod"

export const scoreInsertSchema = z.object({
  score_value: z.number().int().min(1).max(45),
  score_date: z.string().refine(val => {
    const date = new Date(val)
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    return !isNaN(date.getTime()) && date <= today
  }, { message: "Date cannot be in the future" })
})

export const scoreUpdateSchema = scoreInsertSchema.extend({
  id: z.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/, "Invalid ID format")
})

export const scoreDeleteSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/, "Invalid ID format")
})

export type ScoreInsert = z.infer<typeof scoreInsertSchema>
export type ScoreUpdate = z.infer<typeof scoreUpdateSchema>

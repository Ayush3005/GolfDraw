import { z } from 'zod'

export const charitySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(10).max(500),
  image_url: z.string().url().optional().or(z.literal('')),
  website_url: z.string().url().optional().or(z.literal('')),
  is_featured: z.boolean().default(false)
})

export const charitySelectionSchema = z.object({
  charity_id: z.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/, "Invalid ID format"),
  contribution_percentage: z.number().int().min(10).max(100)
})

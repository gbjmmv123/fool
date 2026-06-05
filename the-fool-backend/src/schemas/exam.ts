import { z } from 'zod'
import { userIdSchema } from './bootstrap'

export const submitExamSchema = z.object({
  userId: userIdSchema,
  assignedDepartmentId: z.string().min(1).max(64),
  storyId: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  amonTriggered: z.boolean(),
  overwrite: z.boolean().optional(),
})

export type SubmitExamInput = z.infer<typeof submitExamSchema>

export const examResultQuerySchema = z.object({
  userId: userIdSchema,
  resultId: z.string().min(1).max(64),
  simulateDelay: z.string().optional(),
})

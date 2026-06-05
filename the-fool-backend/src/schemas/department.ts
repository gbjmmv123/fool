import { z } from 'zod'
import { userIdSchema } from './bootstrap'

export const myDepartmentQuerySchema = z.object({
  userId: userIdSchema,
})

export const joinDepartmentSchema = z.object({
  userId: userIdSchema,
  targetDepartmentId: z.string().min(1).max(64),
})

export type JoinDepartmentInput = z.infer<typeof joinDepartmentSchema>

import { z } from 'zod'

export const userIdSchema = z
  .string()
  .min(8, 'userId too short')
  .max(64, 'userId too long')
  .regex(/^uid_[a-zA-Z0-9_]+$/, 'userId format invalid')

export const bootstrapSchema = z.object({
  userId: userIdSchema,
})

export type BootstrapInput = z.infer<typeof bootstrapSchema>

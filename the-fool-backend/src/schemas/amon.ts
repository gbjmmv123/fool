import { z } from 'zod'
import { userIdSchema } from './bootstrap'

export const joinAmonSchema = z.object({
  userId: userIdSchema,
})

export const leaveAmonSchema = z.object({
  userId: userIdSchema,
})

export type JoinAmonInput = z.infer<typeof joinAmonSchema>
export type LeaveAmonInput = z.infer<typeof leaveAmonSchema>

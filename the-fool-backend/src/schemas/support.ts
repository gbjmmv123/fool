import { z } from 'zod'
import { userIdSchema } from './bootstrap'

export const supportSendSchema = z.object({
  userId: userIdSchema,
  content: z.string().trim().min(1, '消息不能为空').max(1000, '消息最多 1000 字'),
})

export const supportPullSchema = z.object({
  userId: userIdSchema,
  sinceId: z.string().min(1).max(64).optional(),
})

export const supportReadSchema = z.object({
  userId: userIdSchema,
  upToId: z.string().min(1).max(64),
})

export const staffMessagesQuerySchema = z.object({
  userId: userIdSchema,
  sinceId: z.string().min(1).max(64).optional(),
})

export const staffReplySchema = z.object({
  userId: userIdSchema,
  content: z.string().trim().min(1, '消息不能为空').max(1000, '消息最多 1000 字'),
})

export type SupportSendInput = z.infer<typeof supportSendSchema>
export type SupportPullInput = z.infer<typeof supportPullSchema>
export type SupportReadInput = z.infer<typeof supportReadSchema>
export type StaffMessagesQueryInput = z.infer<typeof staffMessagesQuerySchema>
export type StaffReplyInput = z.infer<typeof staffReplySchema>

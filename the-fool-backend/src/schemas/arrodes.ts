import { z } from 'zod'
import { userIdSchema } from './bootstrap'

const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(2000),
})

export const arrodesDraftSchema = z.object({
  userId: userIdSchema,
  systemPrompt: z.string().min(1).max(8000),
  messages: z.array(messageSchema).max(50),
})

export type ArrodesDraftInput = z.infer<typeof arrodesDraftSchema>

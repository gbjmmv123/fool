import { z } from 'zod'

export const feedbackSubmitSchema = z.object({
  userId: z.string().min(1).max(64).optional(),
  content: z.string().trim().min(1, '反馈不能为空').max(500, '反馈最多 500 字'),
})

export type FeedbackSubmitInput = z.infer<typeof feedbackSubmitSchema>

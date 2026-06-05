import { z } from 'zod'
import { userIdSchema } from './bootstrap'

export const profileSchema = z.object({
  userId: userIdSchema,
  nickname: z
    .string()
    .trim()
    .min(1, '昵称不能为空')
    .max(16, '昵称最多 16 个字符'),
})

export type ProfileInput = z.infer<typeof profileSchema>

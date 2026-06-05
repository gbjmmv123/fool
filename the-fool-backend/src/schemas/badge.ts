import { z } from 'zod'

const hexColorRegex = /^#[\da-fA-F]{6}$/
const dataUrlRegex = /^data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+$/

export const renderBadgeSchema = z.object({
  name: z.string().trim().min(1).max(12),
  role: z.string().trim().min(1).max(20),
  idText: z.string().trim().min(1).max(32),
  themeColor: z.string().regex(hexColorRegex, 'themeColor must be #RRGGBB'),
  avatarDataUrl: z.string().regex(dataUrlRegex, 'avatarDataUrl must be a base64 data URL'),
})

export type RenderBadgeInput = z.infer<typeof renderBadgeSchema>

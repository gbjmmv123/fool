import { z } from 'zod'

const hexColorRegex = /^#[\da-fA-F]{6}$/
const dataUrlRegex = /^data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+$/

export const renderShareCardSchema = z.object({
  themeColor: z.string().regex(hexColorRegex, 'themeColor must be #RRGGBB'),
  backgroundDataUrl: z.string().regex(dataUrlRegex, 'backgroundDataUrl must be a base64 data URL'),
  qrDataUrl: z.string().regex(dataUrlRegex, 'qrDataUrl must be a base64 data URL'),
  joinedAtText: z.string().trim().min(1).max(64),
  deptTitleText: z.string().trim().min(1).max(64),
  qrLabelText: z.string().trim().min(1).max(32),
})

export type RenderShareCardInput = z.infer<typeof renderShareCardSchema>

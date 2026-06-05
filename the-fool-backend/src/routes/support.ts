import { Hono } from 'hono'
import {
  supportSendSchema,
  supportPullSchema,
  supportReadSchema,
  staffMessagesQuerySchema,
  staffReplySchema,
} from '~/schemas/support'
import { arrodesDraftSchema } from '~/schemas/arrodes'
import * as support from '~/domain/support'
import { generateDraft } from '~/domain/arrodes'

const route = new Hono()

// --- user-facing ---

route.post('/support/send', async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = supportSendSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      { error: 'invalid_request', message: parsed.error.issues[0]?.message ?? 'invalid' },
      400,
    )
  }
  const result = await support.sendUserMessage(parsed.data.userId, parsed.data.content)
  if (!result.ok) return c.json({ error: result.error }, result.status as 404)
  return c.json({ message: result.message, draft: result.draft })
})

route.get('/support/messages', (c) => {
  const userId = c.req.query('userId')
  const sinceId = c.req.query('sinceId')
  const parsed = supportPullSchema.safeParse({ userId, sinceId: sinceId || undefined })
  if (!parsed.success) {
    return c.json(
      { error: 'invalid_request', message: parsed.error.issues[0]?.message ?? 'invalid' },
      400,
    )
  }
  const data = support.pullMessages(parsed.data.userId, parsed.data.sinceId)
  return c.json(data)
})

route.post('/support/read', async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = supportReadSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      { error: 'invalid_request', message: parsed.error.issues[0]?.message ?? 'invalid' },
      400,
    )
  }
  support.markRead(parsed.data.userId, parsed.data.upToId)
  return c.json({ ok: true })
})

// --- staff-facing ---

route.get('/staff/conversations', (c) => {
  return c.json({ conversations: support.listConversations() })
})

route.get('/staff/conversations/:userId/messages', (c) => {
  const userId = c.req.param('userId')
  const sinceId = c.req.query('sinceId')
  const parsed = staffMessagesQuerySchema.safeParse({ userId, sinceId: sinceId || undefined })
  if (!parsed.success) {
    return c.json(
      { error: 'invalid_request', message: parsed.error.issues[0]?.message ?? 'invalid' },
      400,
    )
  }
  const data = support.pullMessages(parsed.data.userId, parsed.data.sinceId)
  return c.json(data)
})

route.post('/staff/reply', async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = staffReplySchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      { error: 'invalid_request', message: parsed.error.issues[0]?.message ?? 'invalid' },
      400,
    )
  }
  const result = support.sendStaffMessage(parsed.data.userId, parsed.data.content)
  if (!result.ok) return c.json({ error: result.error }, result.status as 404)
  return c.json({ message: result.message })
})

// --- arrodes AI draft (管理端手动触发，保留) ---

route.post('/staff/arrodes-draft', async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = arrodesDraftSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      { error: 'invalid_request', message: parsed.error.issues[0]?.message ?? 'invalid' },
      400,
    )
  }
  const result = await generateDraft(parsed.data)
  if (!result.ok) return c.json({ error: result.error }, result.status as 502)
  return c.json({ draft: result.draft })
})

export default route

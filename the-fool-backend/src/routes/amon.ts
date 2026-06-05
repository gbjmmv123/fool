import { Hono } from 'hono'
import { joinAmonSchema, leaveAmonSchema } from '~/schemas/amon'
import { loadAmonMembers, joinAmonTx, leaveAmonTx } from '~/domain/amon'

const route = new Hono()

route.get('/amon/members', (c) => {
  return c.json(loadAmonMembers())
})

route.post('/amon/join', async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = joinAmonSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      { error: 'invalid_request', message: parsed.error.issues[0]?.message ?? 'invalid' },
      400,
    )
  }
  const r = joinAmonTx(parsed.data)
  if (!r.ok) return c.json({ error: r.error }, r.status as any)
  return c.json({ ok: true })
})

route.post('/amon/leave', async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = leaveAmonSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      { error: 'invalid_request', message: parsed.error.issues[0]?.message ?? 'invalid' },
      400,
    )
  }
  const r = leaveAmonTx(parsed.data)
  if (!r.ok) return c.json({ error: r.error }, r.status as any)
  return c.json({ ok: true })
})

export default route

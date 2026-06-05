import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { db } from '~/db/client'
import { users } from '~/db/schema'
import { profileSchema } from '~/schemas/user'
import { nowMs } from '~/utils/time'

const route = new Hono()

route.post('/user/profile', async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = profileSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      { error: 'invalid_request', message: parsed.error.issues[0]?.message ?? 'invalid' },
      400,
    )
  }

  const { userId, nickname } = parsed.data
  const existing = db.select().from(users).where(eq(users.id, userId)).get()
  if (!existing) {
    return c.json({ error: 'user_not_found' }, 404)
  }

  db.update(users)
    .set({ nickname, updatedAt: nowMs() })
    .where(eq(users.id, userId))
    .run()

  return c.json({ ok: true })
})

export default route

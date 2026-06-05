import { Hono } from 'hono'
import { bootstrapSchema } from '~/schemas/bootstrap'
import { buildBootstrapState } from '~/domain/bootstrap'

const route = new Hono()

route.post('/bootstrap', async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = bootstrapSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      { error: 'invalid_request', message: parsed.error.issues[0]?.message ?? 'invalid' },
      400,
    )
  }

  const state = buildBootstrapState(parsed.data.userId)
  return c.json(state)
})

export default route

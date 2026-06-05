import { Hono } from 'hono'

const health = new Hono()

health.get('/health', (c) =>
  c.json({
    ok: true,
    service: 'the-fool-backend',
    time: new Date().toISOString(),
  })
)

export default health

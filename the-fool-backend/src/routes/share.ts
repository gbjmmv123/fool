import { Hono } from 'hono'
import { renderShareCardPng } from '~/domain/share'
import { renderShareCardSchema } from '~/schemas/share'

const route = new Hono()

route.post('/share/render', async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = renderShareCardSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      { error: 'invalid_request', message: parsed.error.issues[0]?.message ?? 'invalid' },
      400,
    )
  }

  const result = await renderShareCardPng(parsed.data)

  c.header('Content-Type', 'image/png')
  c.header('Cache-Control', 'no-store')
  c.header('X-Render-Time-Ms', String(result.renderTimeMs))
  return new Response(new Uint8Array(result.buffer), {
    headers: c.res.headers,
  })
})

export default route

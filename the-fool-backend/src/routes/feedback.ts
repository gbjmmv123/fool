import { Hono } from 'hono'
import { feedbackSubmitSchema } from '~/schemas/feedback'
import * as feedback from '~/domain/feedback'

const route = new Hono()

route.post('/feedback', async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = feedbackSubmitSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      { error: 'invalid_request', message: parsed.error.issues[0]?.message ?? 'invalid' },
      400,
    )
  }
  feedback.submitFeedback(parsed.data.userId, parsed.data.content)
  return c.json({ ok: true })
})

route.get('/staff/feedback', (c) => {
  return c.json({ feedbacks: feedback.listFeedbacks() })
})

export default route

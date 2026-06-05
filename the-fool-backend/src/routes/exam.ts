import { Hono } from 'hono'
import { submitExamSchema, examResultQuerySchema } from '~/schemas/exam'
import { submitExam } from '~/domain/examSubmit'
import { buildExamResult } from '~/domain/examResult'

const route = new Hono()

route.post('/exam/submit', async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = submitExamSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      { error: 'invalid_request', message: parsed.error.issues[0]?.message ?? 'invalid' },
      400,
    )
  }

  const result = submitExam({
    userId: parsed.data.userId,
    assignedDepartmentId: parsed.data.assignedDepartmentId,
    storyId: parsed.data.storyId,
    amonTriggered: parsed.data.amonTriggered,
  })

  if (!result.ok) return c.json({ error: result.error }, result.status as any)
  return c.json(result.payload)
})

route.get('/exam/result', (c) => {
  const parsed = examResultQuerySchema.safeParse({
    userId: c.req.query('userId'),
    resultId: c.req.query('resultId'),
    simulateDelay: c.req.query('simulateDelay'),
  })
  if (!parsed.success) {
    return c.json({ error: 'invalid_request', message: parsed.error.issues[0]?.message ?? 'invalid' }, 400)
  }
  const result = buildExamResult({
    userId: parsed.data.userId,
    resultId: parsed.data.resultId,
    simulatePreparing: parsed.data.simulateDelay === '1',
  })
  if (!result.ok) return c.json({ error: result.error }, result.status as any)
  return c.json(result.payload)
})

export default route

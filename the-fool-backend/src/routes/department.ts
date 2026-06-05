import { Hono } from 'hono'
import { myDepartmentQuerySchema, joinDepartmentSchema } from '~/schemas/department'
import { loadMyDepartment, joinDepartmentTx, loadAllDepartments } from '~/domain/department'

const route = new Hono()

route.get('/departments', (c) => {
  return c.json(loadAllDepartments())
})

route.get('/department/my', (c) => {
  const parsed = myDepartmentQuerySchema.safeParse({ userId: c.req.query('userId') })
  if (!parsed.success) {
    return c.json({ error: 'invalid_request', message: parsed.error.issues[0]?.message ?? 'invalid' }, 400)
  }
  return c.json(loadMyDepartment(parsed.data.userId))
})

route.post('/department/join', async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = joinDepartmentSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'invalid_request', message: parsed.error.issues[0]?.message ?? 'invalid' }, 400)
  }
  const r = joinDepartmentTx(parsed.data)
  if (!r.ok) return c.json({ error: r.error }, r.status as any)
  return c.json({ ok: true })
})

export default route

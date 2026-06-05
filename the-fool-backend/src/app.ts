import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { corsMiddleware } from '~/utils/cors'
import health from '~/routes/health'
import bootstrap from '~/routes/bootstrap'
import user from '~/routes/user'
import exam from '~/routes/exam'
import department from '~/routes/department'
import support from '~/routes/support'
import amon from '~/routes/amon'
import feedback from '~/routes/feedback'

export function createApp() {
  const app = new Hono()

  app.use('*', async (c, next) => {
    const start = Date.now()
    await next()
    console.log(`${c.req.method} ${c.req.path} ${c.res.status} ${Date.now() - start}ms`)
  })
  app.use('*', corsMiddleware)

  app.route('/api', health)
  app.route('/api', bootstrap)
  app.route('/api', user)
  app.route('/api', exam)
  app.route('/api', department)
  app.route('/api', support)
  app.route('/api', amon)
  app.route('/api', feedback)

  app.notFound((c) => c.json({ error: 'not_found' }, 404))
  app.onError((err, c) => {
    if (err instanceof HTTPException) {
      return err.getResponse()
    }
    console.error('[unhandled]', err)
    return c.json({ error: 'internal_error' }, 500)
  })

  return app
}

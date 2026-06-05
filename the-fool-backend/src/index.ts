import 'dotenv/config'
import { serve } from '@hono/node-server'
import { createApp } from './app.js'
import { bootstrapDb } from './db/bootstrap.js'

bootstrapDb()

const port = Number(process.env.PORT ?? 8080)
const app = createApp()

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`[the-fool-backend] listening on http://localhost:${info.port}`)
})

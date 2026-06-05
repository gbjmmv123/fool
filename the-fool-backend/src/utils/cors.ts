import { cors } from 'hono/cors'

const origins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
  .split(',')
  .map((s: string) => s.trim())
  .filter(Boolean)

export const corsMiddleware = cors({
  origin: origins,
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
  credentials: false,
  maxAge: 600,
})

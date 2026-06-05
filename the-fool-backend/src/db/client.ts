import 'dotenv/config'
import path from 'node:path'
import fs from 'node:fs'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema.js'

const DB_PATH = process.env.DB_PATH ?? './data/db.sqlite'

function ensureDir(p: string) {
  const dir = path.dirname(p)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

ensureDir(DB_PATH)

const sqlite = new Database(DB_PATH)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

// --- migrations ---
try {
  const cols = sqlite.pragma('table_info(support_conversations)') as Array<{ name: string }>
  const hasPendingDraft = cols.some((c) => c.name === 'pending_draft')
  if (!hasPendingDraft) {
    sqlite.exec('ALTER TABLE support_conversations ADD COLUMN pending_draft TEXT')
    console.log('[db] Added pending_draft column to support_conversations')
  }
} catch (e) {
  console.error('[db] Migration error:', e)
}

export const db = drizzle(sqlite, { schema })
export const rawDb = sqlite
export { schema }

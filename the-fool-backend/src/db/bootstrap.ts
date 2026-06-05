import fs from 'node:fs'
import path from 'node:path'
import { sql } from 'drizzle-orm'
import { db, rawDb } from './client.js'
import { departments } from './schema.js'

const SEED_DIR = path.resolve('data/seed')

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  nickname TEXT,
  joined_amon INTEGER NOT NULL DEFAULT 0,
  department_id TEXT,
  latest_result_id TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS exam_results (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  assigned_department_id TEXT NOT NULL,
  previous_department_id TEXT,
  story_id INTEGER NOT NULL,
  amon_triggered INTEGER NOT NULL DEFAULT 0,
  joined_at TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS exam_results_user_id_idx ON exam_results(user_id);
CREATE INDEX IF NOT EXISTS exam_results_created_at_idx ON exam_results(created_at);
CREATE INDEX IF NOT EXISTS idx_users_dept ON users(department_id);

CREATE TABLE IF NOT EXISTS support_conversations (
  user_id TEXT PRIMARY KEY,
  unread_by_user INTEGER NOT NULL DEFAULT 0,
  last_message_role TEXT,
  pending_draft TEXT,
  last_message_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS support_messages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('user','staff')),
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS support_messages_user_created_idx ON support_messages(user_id, created_at);

CREATE TABLE IF NOT EXISTS error_feedbacks (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS error_feedbacks_created_at_idx ON error_feedbacks(created_at);
`

export function ensureSchema() {
  rawDb.exec(SCHEMA_SQL)

  // idempotent migrations for existing databases
  const cols = rawDb.prepare(`PRAGMA table_info(support_conversations)`).all() as Array<{ name: string }>

  if (!cols.some(c => c.name === 'last_message_role')) {
    rawDb.exec(`ALTER TABLE support_conversations ADD COLUMN last_message_role TEXT`)
    console.log('[db] Added last_message_role column to support_conversations')
  }

  if (!cols.some(c => c.name === 'pending_draft')) {
    rawDb.exec(`ALTER TABLE support_conversations ADD COLUMN pending_draft TEXT`)
    console.log('[db] Added pending_draft column to support_conversations')
  }
}

function readJson<T>(file: string): T {
  const fp = path.join(SEED_DIR, file)
  return JSON.parse(fs.readFileSync(fp, 'utf-8')) as T
}

export function ensureSeed() {
  const deptCount = db.select({ c: sql<number>`COUNT(*)` }).from(departments).all()[0]?.c ?? 0
  if (deptCount === 0) {
    const seed = readJson<(typeof departments.$inferInsert)[]>('departments.json')
    db.insert(departments).values(seed).run()
    console.log(`[seed] departments inserted: ${seed.length}`)
  }
}

export function bootstrapDb() {
  ensureSchema()
  ensureSeed()
}

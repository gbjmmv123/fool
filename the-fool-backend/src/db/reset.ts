import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'

const DB_PATH = process.env.DB_PATH ?? './data/db.sqlite'

for (const f of [DB_PATH, `${DB_PATH}-journal`, `${DB_PATH}-wal`, `${DB_PATH}-shm`]) {
  const fp = path.resolve(f)
  if (fs.existsSync(fp)) {
    fs.unlinkSync(fp)
    console.log(`[reset] removed ${fp}`)
  }
}

import('./bootstrap.js').then(({ bootstrapDb }) => {
  bootstrapDb()
  console.log('[reset] schema + seed re-created')
})

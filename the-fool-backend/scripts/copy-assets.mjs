import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const rootDir = resolve(import.meta.dirname, '..')
const srcFontsDir = resolve(rootDir, 'src/assets/fonts')
const distFontsDir = resolve(rootDir, 'dist/assets/fonts')

if (!existsSync(srcFontsDir)) {
  process.exit(0)
}

mkdirSync(distFontsDir, { recursive: true })
cpSync(srcFontsDir, distFontsDir, { recursive: true })

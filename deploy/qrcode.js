/**
 * QR Code Generator for theFool
 * Generates a PNG QR code that works in WeChat (微信扫码打开)
 *
 * NOTE: Must be run from the-fool-backend directory (depends on its qrcode package)
 *
 * Usage: cd the-fool-backend && node ../deploy/qrcode.js <url> [output-path]
 * Example: cd the-fool-backend && node ../deploy/qrcode.js https://fool.example.com
 */

import QRCode from 'qrcode'
import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const url = process.argv[2]
const output = process.argv[3] || resolve(__dirname, 'thefool-qr.png')

if (!url) {
  console.error('Usage: cd the-fool-backend && node ../deploy/qrcode.js <url> [output-path]')
  process.exit(1)
}

try {
  new URL(url)
} catch {
  console.error('❌ Invalid URL. Must start with http:// or https://')
  process.exit(1)
}

const outPath = resolve(output)

QRCode.toFile(
  outPath,
  url,
  {
    type: 'png',
    width: 512,
    margin: 2,
    color: {
      dark: '#1a1a2e',
      light: '#f5f0e8',
    },
    errorCorrectionLevel: 'M',
  },
  (err) => {
    if (err) {
      console.error('❌ Failed to generate QR code:', err.message)
      process.exit(1)
    }
    console.log(`✅ QR code saved to: ${outPath}`)
    console.log(`   URL: ${url}`)
    console.log(`   WeChat compatible: ✅  (HTTPS required for WeChat)`)
  },
)

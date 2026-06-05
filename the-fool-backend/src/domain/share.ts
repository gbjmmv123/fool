import { createCanvas, loadImage } from '@napi-rs/canvas'
import { registerFont } from '@napi-rs/canvas/node-canvas.js'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { RenderShareCardInput } from '~/schemas/share'

const EXPORT_WIDTH_PX = 1260
const EXPORT_HEIGHT_PX = 2100

const __dirname = dirname(fileURLToPath(import.meta.url))
const FONT_STACK = '"Noto Sans SC", "Helvetica Neue", Arial, sans-serif'
const NOTO_SANS_SC_PATH = resolveFontPath('NotoSansSC-Regular.otf')

let fontRegistered = false

export async function renderShareCardPng(input: RenderShareCardInput) {
  const startedAt = Date.now()
  ensureShareFonts()

  const canvas = createCanvas(EXPORT_WIDTH_PX, EXPORT_HEIGHT_PX)
  const ctx = canvas.getContext('2d') as any

  drawBackground(ctx, input.themeColor)
  await drawMainImage(ctx, input.backgroundDataUrl)
  drawCopy(ctx, input)
  await drawQr(ctx, input.qrDataUrl)

  return {
    buffer: canvas.toBuffer('image/png'),
    renderTimeMs: Date.now() - startedAt,
  }
}

function drawBackground(ctx: any, themeColor: string) {
  const gradient = ctx.createLinearGradient(0, 0, EXPORT_WIDTH_PX, EXPORT_HEIGHT_PX)
  gradient.addColorStop(0, mixHex(themeColor, '#ffffff', 0.18))
  gradient.addColorStop(1, '#ffffff')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, EXPORT_WIDTH_PX, EXPORT_HEIGHT_PX)
}

async function drawMainImage(ctx: any, backgroundDataUrl: string) {
  const image = await loadImage(backgroundDataUrl)
  const { drawWidth, drawHeight, drawX, drawY } = fitContain(image.width, image.height, EXPORT_WIDTH_PX, EXPORT_HEIGHT_PX)
  ctx.drawImage(image as any, drawX, drawY, drawWidth, drawHeight)
}

function drawCopy(ctx: any, input: RenderShareCardInput) {
  const centerX = EXPORT_WIDTH_PX / 2
  const textBottom = EXPORT_HEIGHT_PX - 42
  const lineHeight = 44

  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#8c847c'
  ctx.font = `400 28px ${FONT_STACK}`
  ctx.shadowColor = 'rgba(255, 255, 255, 0.5)'
  ctx.shadowBlur = 2
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 1
  ctx.fillText(input.joinedAtText, centerX, textBottom - lineHeight * 2)
  ctx.fillText(input.deptTitleText, centerX, textBottom - lineHeight)
  ctx.fillText(input.qrLabelText, centerX, textBottom)
  ctx.restore()
}

async function drawQr(ctx: any, qrDataUrl: string) {
  const qr = await loadImage(qrDataUrl)
  const size = 120
  const x = EXPORT_WIDTH_PX - 63 - size
  const y = EXPORT_HEIGHT_PX - 52 - size
  ctx.drawImage(qr as any, x, y, size, size)
}

function fitContain(sourceWidth: number, sourceHeight: number, targetWidth: number, targetHeight: number) {
  const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight)
  const drawWidth = sourceWidth * scale
  const drawHeight = sourceHeight * scale
  const drawX = (targetWidth - drawWidth) / 2
  const drawY = (targetHeight - drawHeight) / 2
  return { drawWidth, drawHeight, drawX, drawY }
}

function mixHex(hexA: string, hexB: string, ratioA: number) {
  const ratio = Math.min(1, Math.max(0, ratioA))
  const a = parseHex(hexA)
  const b = parseHex(hexB)
  const r = Math.round(a.r * ratio + b.r * (1 - ratio))
  const g = Math.round(a.g * ratio + b.g * (1 - ratio))
  const bValue = Math.round(a.b * ratio + b.b * (1 - ratio))
  return `rgb(${r}, ${g}, ${bValue})`
}

function parseHex(hex: string) {
  const value = hex.replace('#', '')
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  }
}

function ensureShareFonts() {
  if (fontRegistered) return
  if (!existsSync(NOTO_SANS_SC_PATH)) return
  registerFont(NOTO_SANS_SC_PATH, { family: 'Noto Sans SC' })
  fontRegistered = true
}

function resolveFontPath(fileName: string) {
  const fallbackPath = resolve(__dirname, '../assets/fonts', fileName)
  const candidates = [
    fallbackPath,
    resolve(__dirname, './assets/fonts', fileName),
    resolve(process.cwd(), 'src/assets/fonts', fileName),
    resolve(process.cwd(), 'dist/assets/fonts', fileName),
    resolve(process.cwd(), 'assets/fonts', fileName),
  ]

  return candidates.find(path => existsSync(path)) ?? fallbackPath
}

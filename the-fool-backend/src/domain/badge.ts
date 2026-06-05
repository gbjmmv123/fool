import { createCanvas, loadImage } from '@napi-rs/canvas'
import { registerFont } from '@napi-rs/canvas/node-canvas.js'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { RenderBadgeInput } from '~/schemas/badge'

const EXPORT_WIDTH_PX = 1252
const EXPORT_HEIGHT_PX = 2159
const CARD_WIDTH = 276
const CARD_HEIGHT = EXPORT_HEIGHT_PX / (EXPORT_WIDTH_PX / CARD_WIDTH)
const SCALE = EXPORT_WIDTH_PX / CARD_WIDTH

const __dirname = dirname(fileURLToPath(import.meta.url))
const FONT_STACK = '"Noto Sans SC", "Helvetica Neue", Arial, sans-serif'
const NOTO_SANS_SC_PATH = resolveFontPath('NotoSansSC-Regular.otf')

let fontRegistered = false

export async function renderBadgePng(input: RenderBadgeInput) {
  const startedAt = Date.now()
  ensureBadgeFonts()
  const canvas = createCanvas(EXPORT_WIDTH_PX, EXPORT_HEIGHT_PX)
  const ctx = canvas.getContext('2d') as any

  ctx.scale(SCALE, SCALE)
  ctx.save()
  drawRoundedRect(ctx, 0, 0, CARD_WIDTH, CARD_HEIGHT, 22)
  ctx.clip()
  drawCardBase(ctx)
  drawSlot(ctx)
  drawBand(ctx, input.themeColor)
  drawHeader(ctx, input.themeColor)
  await drawAvatar(ctx, input.avatarDataUrl)
  drawInfo(ctx, input)
  drawFooter(ctx, input)
  ctx.restore()

  return {
    buffer: canvas.toBuffer('image/png'),
    renderTimeMs: Date.now() - startedAt,
  }
}

function drawCardBase(ctx: any) {
  drawRoundedRect(ctx, 0, 0, CARD_WIDTH, CARD_HEIGHT, 22)
  ctx.fillStyle = '#ffffff'
  ctx.fill()

  drawRoundedRect(ctx, 0.5, 0.5, CARD_WIDTH - 1, CARD_HEIGHT - 1, 21.5)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)'
  ctx.lineWidth = 1
  ctx.stroke()
}

function drawSlot(ctx: any) {
  const x = 98
  const y = 28
  const width = 80
  const height = 16
  const gradient = ctx.createLinearGradient(0, y, 0, y + height)
  gradient.addColorStop(0, '#bdbdbd')
  gradient.addColorStop(1, '#dcdcdc')

  drawRoundedRect(ctx, x, y, width, height, 999)
  ctx.fillStyle = gradient
  ctx.fill()
}

function drawBand(ctx: any, themeColor: string) {
  ctx.save()
  ctx.fillStyle = themeColor
  ctx.beginPath()
  ctx.moveTo(0, CARD_HEIGHT - 88 + 28.16)
  ctx.lineTo(CARD_WIDTH, CARD_HEIGHT - 88)
  ctx.lineTo(CARD_WIDTH, CARD_HEIGHT)
  ctx.lineTo(0, CARD_HEIGHT)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawHeader(ctx: any, themeColor: string) {
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'

  ctx.fillStyle = '#2f2f2f'
  ctx.font = `900 20px ${FONT_STACK}`
  ctx.fillText('愚者教会', 20, 60)

  ctx.fillStyle = themeColor
  ctx.font = `600 10px ${FONT_STACK}`
  ctx.fillText('CHURCH OF THE FOOL', 20, 83)
}

async function drawAvatar(ctx: any, avatarDataUrl: string) {
  const wrapX = 44
  const wrapY = 116
  const wrapSize = 188
  const avatarScale = 1.3

  const avatar = await loadImage(avatarDataUrl)
  const containScale = Math.min(wrapSize / avatar.width, wrapSize / avatar.height) * avatarScale
  const drawWidth = avatar.width * containScale
  const drawHeight = avatar.height * containScale
  const drawX = wrapX + (wrapSize - drawWidth) / 2
  const drawY = wrapY + (wrapSize - drawHeight) / 2

  ctx.drawImage(avatar as any, drawX, drawY, drawWidth, drawHeight)
}

function drawInfo(ctx: any, input: RenderBadgeInput) {
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  ctx.fillStyle = '#303030'
  ctx.font = `900 24px ${FONT_STACK}`
  ctx.fillText(input.name, CARD_WIDTH / 2, 328)

  ctx.fillStyle = input.themeColor
  ctx.font = `700 12px ${FONT_STACK}`
  ctx.fillText(input.role, CARD_WIDTH / 2, 362)

  const roleWidth = Math.min(ctx.measureText(input.role).width, CARD_WIDTH - 48)
  ctx.strokeStyle = input.themeColor
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(CARD_WIDTH / 2 - roleWidth / 2 - 3, 377.5)
  ctx.lineTo(CARD_WIDTH / 2 + roleWidth / 2 + 3, 377.5)
  ctx.stroke()
}

function drawFooter(ctx: any, input: RenderBadgeInput) {
  ctx.textBaseline = 'alphabetic'

  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'left'
  ctx.font = `500 12px ${FONT_STACK}`
  ctx.fillText(input.idText, 22, CARD_HEIGHT - 18)

  ctx.textAlign = 'right'
  ctx.font = `900 16px ${FONT_STACK}`
  ctx.fillText('愚者教会', CARD_WIDTH - 22, CARD_HEIGHT - 18)
}

function drawRoundedRect(
  ctx: any,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const safeRadius = Math.max(0, Math.min(radius, width / 2, height / 2))
  ctx.beginPath()
  ctx.moveTo(x + safeRadius, y)
  ctx.arcTo(x + width, y, x + width, y + height, safeRadius)
  ctx.arcTo(x + width, y + height, x, y + height, safeRadius)
  ctx.arcTo(x, y + height, x, y, safeRadius)
  ctx.arcTo(x, y, x + width, y, safeRadius)
  ctx.closePath()
}

function ensureBadgeFonts() {
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

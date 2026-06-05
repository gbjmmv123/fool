import { randomBytes } from 'node:crypto'

function shortId(): string {
  const t = Date.now().toString(36)
  const r = randomBytes(4).toString('hex').slice(0, 6)
  return `${t}_${r}`
}

export function generateResultId(): string {
  return `result_${shortId()}`
}

export function generateSupportMessageId(): string {
  return `sm_${shortId()}`
}

export function generateFeedbackId(): string {
  return `fb_${shortId()}`
}

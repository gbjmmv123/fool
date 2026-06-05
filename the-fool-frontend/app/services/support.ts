import { apiRequest } from './api'
import type { SupportPullResponse, SupportSendResponse } from '~/types/support'

export function sendSupportMessage(userId: string, content: string) {
  return apiRequest<SupportSendResponse>('/api/support/send', {
    method: 'POST',
    body: { userId, content },
  })
}

export function pullSupportMessages(userId: string, sinceId?: string) {
  const query: Record<string, string> = { userId }
  if (sinceId) query.sinceId = sinceId
  return apiRequest<SupportPullResponse>('/api/support/messages', {
    method: 'GET',
    query,
  })
}

export function markSupportRead(userId: string, upToId: string) {
  return apiRequest<{ ok: boolean }>('/api/support/read', {
    method: 'POST',
    body: { userId, upToId },
  })
}

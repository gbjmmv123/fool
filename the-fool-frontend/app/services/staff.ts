import { apiRequest } from './api'
import type { StaffConversationsResponse, StaffReplyResponse, SupportPullResponse } from '~/types/support'

const SILENT = { silent: true }

export function listStaffConversations() {
  return apiRequest<StaffConversationsResponse>('/api/staff/conversations', { method: 'GET' }, SILENT)
}

export function pullStaffMessages(userId: string, sinceId?: string) {
  const query: Record<string, string> = {}
  if (sinceId) query.sinceId = sinceId
  return apiRequest<SupportPullResponse>(
    `/api/staff/conversations/${encodeURIComponent(userId)}/messages`,
    { method: 'GET', query },
    SILENT,
  )
}

export function sendStaffReply(userId: string, content: string) {
  return apiRequest<StaffReplyResponse>('/api/staff/reply', {
    method: 'POST',
    body: { userId, content },
  }, SILENT)
}

export function requestArrodesDraft(body: { userId: string; systemPrompt: string; messages: Array<{ role: 'user' | 'assistant'; content: string }> }) {
  return apiRequest<{ draft: string }>('/api/staff/arrodes-draft', {
    method: 'POST',
    body,
  })
}

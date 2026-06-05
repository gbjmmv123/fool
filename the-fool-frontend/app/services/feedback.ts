import { apiRequest } from './api'
import type { FeedbackListResponse } from '~/types/feedback'

const SILENT = { silent: true }

export function submitFeedback(content: string, userId?: string) {
  return apiRequest<{ ok: boolean }>('/api/feedback', {
    method: 'POST',
    body: { content, userId },
  }, SILENT)
}

export function listStaffFeedbacks() {
  return apiRequest<FeedbackListResponse>('/api/staff/feedback', { method: 'GET' }, SILENT)
}

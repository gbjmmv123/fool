import { apiRequest } from './api'
import type { ExamSubmitRequest, ExamSubmitResponse } from '~/types/exam'
import type { ExamResultResponse } from '~/types/result'

export function submitExam(payload: ExamSubmitRequest) {
  return apiRequest<ExamSubmitResponse>('/api/exam/submit', {
    method: 'POST',
    body: payload,
  })
}

export function fetchExamResult(userId: string, resultId: string) {
  return apiRequest<ExamResultResponse>('/api/exam/result', {
    query: { userId, resultId },
  })
}

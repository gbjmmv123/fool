import type { UserBootstrapState } from '~/types/user'
import { apiRequest } from './api'

export function fetchBootstrap(userId: string) {
  return apiRequest<UserBootstrapState>('/api/bootstrap', {
    method: 'POST',
    body: { userId },
  })
}

export interface UpdateProfileResponse {
  ok: boolean
}

export function updateUserProfile(userId: string, nickname: string) {
  return apiRequest<UpdateProfileResponse>('/api/user/profile', {
    method: 'POST',
    body: { userId, nickname },
  })
}

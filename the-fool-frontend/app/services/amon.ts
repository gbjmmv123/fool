import { apiRequest } from './api'
import type { AmonMember, AmonMembersResponse } from '~/types/amon'

export function fetchAmonMembers() {
  return apiRequest<AmonMembersResponse>('/api/amon/members')
}

export function joinAmon(userId: string) {
  return apiRequest<{ ok: boolean }>('/api/amon/join', {
    method: 'POST',
    body: { userId },
  })
}

export function leaveAmon(userId: string) {
  return apiRequest<{ ok: boolean }>('/api/amon/leave', {
    method: 'POST',
    body: { userId },
  })
}

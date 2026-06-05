import { apiRequest } from './api'
import type { MyDepartmentResponse, DepartmentDetail } from '~/types/department'

export function fetchMyDepartment(userId: string) {
  return apiRequest<MyDepartmentResponse>('/api/department/my', { query: { userId } })
}

export interface AllDepartmentsResponse {
  departments: DepartmentDetail[]
}

export function fetchAllDepartments() {
  return apiRequest<AllDepartmentsResponse>('/api/departments')
}

export interface JoinDepartmentResponse { ok: boolean }

export function joinDepartment(userId: string, targetDepartmentId: string) {
  return apiRequest<JoinDepartmentResponse>('/api/department/join', {
    method: 'POST',
    body: { userId, targetDepartmentId },
  })
}


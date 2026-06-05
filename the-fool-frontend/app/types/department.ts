export type DepartmentId =
  | 'justice'
  | 'hangedman'
  | 'sun'
  | 'magician'
  | 'moon'
  | 'hermit'
  | 'star'
  | 'judgement'

export interface DepartmentSummary {
  id: string
  name: string
}

export interface DepartmentMember {
  userId: string
  nickname: string
  joinedAt: string
}

export interface DepartmentDetail extends DepartmentSummary {
  members: DepartmentMember[]
  memberCount: number
}

export interface MyDepartmentResponse {
  status: 'no_exam' | 'pending_assignment' | 'assigned'
  department?: DepartmentDetail
  examSummary?: {
    resultId: string
    joinedAt: string
  }
}

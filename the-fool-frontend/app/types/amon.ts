export interface AmonMember {
  userId: string
  nickname: string
  departmentId: string | null
  joinedAt: number
}

export interface AmonMembersResponse {
  members: AmonMember[]
}

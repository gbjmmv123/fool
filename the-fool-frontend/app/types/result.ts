export type StoryId = 1 | 2 | 3

export interface ExamResultDetail {
  nickname: string
  joinedAt: string
}

export interface ExamResultTransferCard {
  show: boolean
  targetDepartmentId: string
  targetDepartmentName: string
}

export interface ExamResultResponse {
  loadingState: 'preparing' | 'done'
  storyId: StoryId
  amonTriggered: boolean
  assignedDepartmentId: string
  assignedDepartmentName: string
  detail: ExamResultDetail
  transferCard?: ExamResultTransferCard
}

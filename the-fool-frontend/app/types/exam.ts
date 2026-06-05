export interface ExamOption {
  id: string
  label: string
}

export interface ExamQuestion {
  id: string
  title: string
  options: ExamOption[]
}

export interface ExamSubmitRequest {
  userId: string
  assignedDepartmentId: string
  storyId: 1 | 2 | 3
  amonTriggered: boolean
  overwrite?: boolean
}

export interface ExamSubmitTransferCard {
  show: boolean
  from: { id: string; name: string }
  to: { id: string; name: string }
}

export interface ExamSubmitResponse {
  resultId: string
  storyId: 1 | 2 | 3
  amonTriggered: boolean
  transferCard?: ExamSubmitTransferCard
}

export interface ExamDraft {
  version: string
  answers: Record<string, string>
  updatedAt: number
}

// --- Support ---

export type SupportRole = 'user' | 'staff'

export interface SupportMessageDTO {
  id: string
  role: SupportRole
  content: string
  createdAt: string
}

export interface SupportSendResponse {
  message: SupportMessageDTO
  draft?: string
}

export interface SupportPullResponse {
  messages: SupportMessageDTO[]
  latestId: string | null
  unread: number
}

export interface StaffConversationDTO {
  userId: string
  nickname: string | null
  lastMessageAt: string
  lastMessageRole: SupportRole | null
  lastMessagePreview: string
  needsReply: boolean
  pendingDraft: string | null
}

export interface StaffConversationsResponse {
  conversations: StaffConversationDTO[]
}

export interface StaffReplyResponse {
  message: SupportMessageDTO
}

// --- Feedback ---

export interface FeedbackItem {
  id: string
  userId: string | null
  content: string
  createdAt: string
}

export interface FeedbackListResponse {
  feedbacks: FeedbackItem[]
}

// --- Bootstrap ---

export type HomepageMessageType = 'name' | 'urge_exam' | 'welcome_back'

export interface UserBootstrapState {
  userId: string
  nickname: string | null
  isNewUser: boolean
  hasCompletedExam: boolean
  hasDepartment: boolean
  departmentId: string | null
  departmentName: string | null
  joinedAmonFamily: boolean
  latestExamResultId: string | null
  homepageMessageType: HomepageMessageType
}

// --- Department ---

export interface DepartmentMember {
  userId: string
  nickname: string
  joinedAt: string
}

export interface DepartmentDetail {
  id: string
  name: string
  members: DepartmentMember[]
  memberCount: number
}

export type MyDepartmentResponse =
  | { status: 'no_exam' }
  | { status: 'pending_assignment' }
  | {
      status: 'assigned'
      department: DepartmentDetail
      examSummary?: { resultId: string; joinedAt: string }
    }

// --- Exam Result ---

export interface ExamResultDetail {
  nickname: string
  joinedAt: string
}

export interface ExamResultResponse {
  loadingState: 'preparing' | 'done'
  storyId: 1 | 2 | 3
  amonTriggered: boolean
  assignedDepartmentId: string
  assignedDepartmentName: string
  detail: ExamResultDetail
  transferCard?: {
    show: boolean
    targetDepartmentId: string
    targetDepartmentName: string
  }
}

// --- Exam Submit ---

export interface TransferCard {
  show: boolean
  from: { id: string; name: string }
  to: { id: string; name: string }
}

export interface ExamSubmitResponse {
  resultId: string
  storyId: 1 | 2 | 3
  amonTriggered: boolean
  transferCard?: TransferCard
}

// --- Amon ---

export interface AmonMember {
  userId: string
  nickname: string
}

export interface AmonListResponse {
  members: AmonMember[]
}

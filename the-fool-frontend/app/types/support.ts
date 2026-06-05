export type SupportRole = 'user' | 'staff'

export interface SupportMessage {
  id: string
  role: SupportRole
  content: string
  createdAt: string
}

export interface SupportSendResponse {
  message: SupportMessage
  draft?: string
}

export interface SupportPullResponse {
  messages: SupportMessage[]
  latestId: string | null
  unread: number
}

export interface StaffConversation {
  userId: string
  nickname: string | null
  lastMessageAt: string
  lastMessageRole: SupportRole | null
  lastMessagePreview: string
  needsReply: boolean
  pendingDraft: string | null
}

export interface StaffConversationsResponse {
  conversations: StaffConversation[]
}

export interface StaffReplyResponse {
  message: SupportMessage
}
export interface ArrodesDraftRequest {
  userId: string
  systemPrompt: string
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
}

export interface ArrodesDraftResponse {
  draft: string
}

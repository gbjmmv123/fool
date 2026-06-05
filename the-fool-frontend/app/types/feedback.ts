export interface FeedbackItem {
  id: string
  userId: string | null
  content: string
  createdAt: string
}

export interface FeedbackListResponse {
  feedbacks: FeedbackItem[]
}

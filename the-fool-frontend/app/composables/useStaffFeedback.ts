import type { FeedbackItem } from '~/types/feedback'
import { listStaffFeedbacks } from '~/services/feedback'

export function useStaffFeedback() {
  const feedbacks = useState<FeedbackItem[]>('church-staff-feedbacks', () => [])
  const loading = useState<boolean>('church-staff-feedbacks-loading', () => false)
  const error = useState<string | null>('church-staff-feedbacks-error', () => null)

  async function loadFeedbacks() {
    loading.value = true
    error.value = null
    try {
      const res = await listStaffFeedbacks()
      feedbacks.value = res.feedbacks
    } catch (e) {
      error.value = e instanceof Error ? e.message : '加载失败'
    } finally {
      loading.value = false
    }
  }

  return { feedbacks, loading, error, loadFeedbacks }
}

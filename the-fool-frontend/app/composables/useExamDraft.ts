import type { ExamDraft } from '~/types/exam'
import { useDebounceFn } from '@vueuse/core'
import { EXAM_VERSION } from '~/data/questions'

const STORAGE_KEY = 'church_exam_draft'
const STORAGE_KEY_TS = 'church_exam_draft_updated_at'

export function useExamDraft() {
  const draft = useState<ExamDraft | null>('church-exam-draft', () => null)

  function load(): ExamDraft | null {
    if (!import.meta.client) return null
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw) as ExamDraft
      if (parsed?.version && parsed?.answers) {
        draft.value = parsed
        return parsed
      }
    } catch {}
    return null
  }

  function persist(next: ExamDraft) {
    draft.value = next
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      localStorage.setItem(STORAGE_KEY_TS, String(next.updatedAt))
    }
  }

  const debouncedSave = useDebounceFn((next: ExamDraft) => persist(next), 600)

  function clear() {
    draft.value = null
    if (import.meta.client) {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(STORAGE_KEY_TS)
    }
  }

  function reconcile(): Record<string, string> {
    const stored = load()
    if (!stored) return {}
    if (stored.version !== EXAM_VERSION) {
      clear()
      return {}
    }
    return stored.answers
  }

  return { draft, load, persist, debouncedSave, clear, reconcile }
}

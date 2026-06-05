import { fetchExamResult } from '~/services/exam'
import { joinDepartment } from '~/services/department'
import type { ExamResultResponse } from '~/types/result'
import { RESULT } from '~/data/copy'

export type ResultStage = 'loading' | 'cinematic' | 'detail' | 'error'
export type StorySubStage = 'text-in' | 'text-hold' | 'text-out' | 'amon-in' | 'amon-out' | 'finished'

export function useExamResultStory() {
  const stage = useState<ResultStage>('church-result-stage', () => 'loading')
  const storySub = useState<StorySubStage>('church-result-story-sub', () => 'text-in')
  const data = useState<ExamResultResponse | null>('church-result-data', () => null)
  const error = useState<string | null>('church-result-error', () => null)
  const reduced = useReducedMotion()

  const route = useRoute()
  const { userId } = useUserIdentity()
  const { refresh } = useBootstrap()

  async function init() {
    const resultId = route.query.resultId
    if (typeof resultId !== 'string' || !resultId) {
      stage.value = 'error'
      error.value = RESULT.noResultId
      return
    }
    const id = userId.value
    if (!id) return

    const isFresh = route.query.fresh === '1'
    if (isFresh && import.meta.client) {
      const url = new URL(window.location.href)
      url.searchParams.delete('fresh')
      history.replaceState(null, '', url.toString())
    }

    stage.value = 'loading'
    error.value = null

    try {
      const resp = await fetchExamResult(id, resultId)
      data.value = resp
      if (resp.loadingState !== 'done') {
        await wait(1500)
        const retry = await fetchExamResult(id, resultId)
        data.value = retry
      }
      if (data.value?.transferCard?.show) {
        await joinDepartment(id, data.value.transferCard.targetDepartmentId)
        await refresh(true)
      }
      if (isFresh && !reduced.value) {
        stage.value = 'cinematic'
      } else {
        stage.value = 'detail'
      }
    } catch (e) {
      stage.value = 'error'
      error.value = e instanceof Error ? e.message : RESULT.loadFailed
    }
  }

  function cinematicDone() {
    stage.value = 'detail'
  }

  function wait(ms: number) { return new Promise<void>(r => setTimeout(r, ms)) }

  function retry() { init() }

  return { stage, storySub, data, error, init, retry, cinematicDone }
}

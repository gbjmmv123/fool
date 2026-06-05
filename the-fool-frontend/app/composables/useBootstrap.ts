import { fetchBootstrap } from '~/services/user'
import { t } from '~/data/copy'
import type { UserBootstrapState } from '~/types/user'

const defaultState = (): UserBootstrapState => ({
  userId: '',
  nickname: null,
  isNewUser: true,
  hasCompletedExam: false,
  hasDepartment: false,
  departmentId: null,
  departmentName: null,
  joinedAmonFamily: false,
  latestExamResultId: null,
  homepageMessageType: 'none',
})

export function useBootstrap() {
  const state = useState<UserBootstrapState>('church-bootstrap-state', defaultState)
  const loading = useState<boolean>('church-bootstrap-loading', () => false)
  const error = useState<string | null>('church-bootstrap-error', () => null)
  const initialized = useState<boolean>('church-bootstrap-initialized', () => false)

  const { initFromStorage } = useUserIdentity()

  async function refresh(force = false): Promise<UserBootstrapState> {
    if (!import.meta.client) return state.value
    if (loading.value) return state.value
    if (initialized.value && !force) return state.value

    const userId = initFromStorage()
    if (!userId) return state.value

    loading.value = true
    error.value = null

    try {
      const result = await fetchBootstrap(userId)
      state.value = result
      initialized.value = true
      return result
    } catch (e) {
      error.value = e instanceof Error ? e.message : t('用户数据初始化失败', {})
      throw e
    } finally {
      loading.value = false
    }
  }

  function patchState(patch: Partial<UserBootstrapState>) {
    state.value = { ...state.value, ...patch }
  }

  function resetState() {
    state.value = defaultState()
    loading.value = false
    error.value = null
    initialized.value = false
  }

  return {
    state,
    loading,
    error,
    initialized,
    refresh,
    patchState,
    resetState,
  }
}

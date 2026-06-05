const USER_ID_KEY = 'church_user_id'

export function useUserIdentity() {
  const userId = useState<string | null>('church-user-id-state', () => null)
  const ready = useState<boolean>('church-user-id-ready', () => false)

  const isLoggedIn = computed(() => Boolean(userId.value))

  function initFromStorage(): string | null {
    if (!import.meta.client) return null
    if (ready.value) return userId.value

    userId.value = localStorage.getItem(USER_ID_KEY)
    ready.value = true
    return userId.value
  }

  function generateUserId(): string {
    return `uid_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  }

  function setLoggedInUser(nextUserId: string) {
    if (!import.meta.client) return
    localStorage.setItem(USER_ID_KEY, nextUserId)
    userId.value = nextUserId
    ready.value = true
  }

  function clearLoginState() {
    if (!import.meta.client) return
    localStorage.removeItem(USER_ID_KEY)
    userId.value = null
    ready.value = true
  }

  return {
    userId,
    ready,
    isLoggedIn,
    initFromStorage,
    generateUserId,
    setLoggedInUser,
    clearLoginState,
  }
}

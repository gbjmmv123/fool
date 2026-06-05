const STAFF_PASSWORD = 'xinyu1110'
const STAFF_UNLOCK_KEY = 'church_staff_unlocked'

export function useStaffAuth() {
  const unlocked = useState<boolean>('church-staff-unlocked', () => {
    if (!import.meta.client) return false
    return localStorage.getItem(STAFF_UNLOCK_KEY) === '1'
  })

  function tryUnlock(input: string): boolean {
    if (input.trim() === STAFF_PASSWORD) {
      unlocked.value = true
      if (import.meta.client) localStorage.setItem(STAFF_UNLOCK_KEY, '1')
      return true
    }
    return false
  }

  function lock() {
    unlocked.value = false
    if (import.meta.client) localStorage.removeItem(STAFF_UNLOCK_KEY)
  }

  return { unlocked, tryUnlock, lock }
}

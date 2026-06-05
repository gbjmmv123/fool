import type { SupportMessage } from '~/types/support'
import { sendSupportMessage, pullSupportMessages, markSupportRead } from '~/services/support'

const POLL_OPEN_MS = 4000
const POLL_CLOSED_MS = 30000
const LAST_SEEN_KEY = 'church_support_last_seen_id'

function readLastSeen(): string | null {
  if (!import.meta.client) return null
  return localStorage.getItem(LAST_SEEN_KEY)
}

function writeLastSeen(id: string | null) {
  if (!import.meta.client) return
  if (id) localStorage.setItem(LAST_SEEN_KEY, id)
  else localStorage.removeItem(LAST_SEEN_KEY)
}

export function useSupport() {
  const messages = useState<SupportMessage[]>('church-support-messages', () => [])
  const latestId = useState<string | null>('church-support-latest-id', () => null)
  const lastSeenId = useState<string | null>('church-support-last-seen-id', () => readLastSeen())
  const unread = useState<number>('church-support-unread', () => 0)
  const open = useState<boolean>('church-support-open', () => false)
  const sending = useState<boolean>('church-support-sending', () => false)
  const thinking = useState<boolean>('church-support-thinking', () => false)
  const error = useState<string | null>('church-support-error', () => null)
  const pollHandle = useState<{ id: number | null }>('church-support-poll', () => ({ id: null }))
  const pendingDraft = useState<string | null>('church-support-pending-draft', () => null)

  const { userId } = useUserIdentity()

  function appendMessages(incoming: SupportMessage[]) {
    if (incoming.length === 0) return
    const seen = new Set(messages.value.map(m => m.id))
    const fresh = incoming.filter(m => !seen.has(m.id))
    if (fresh.length === 0) return
    messages.value = [...messages.value, ...fresh]
    latestId.value = messages.value[messages.value.length - 1]!.id

    // 如果有 staff 回复到来，结束等待状态
    if (thinking.value && fresh.some(m => m.role === 'staff')) {
      thinking.value = false
    }
  }

  async function pull() {
    const id = userId.value
    if (!id) return
    try {
      const res = await pullSupportMessages(id, latestId.value ?? undefined)
      if (latestId.value === null && res.messages.length > 0) {
        messages.value = res.messages
        latestId.value = res.latestId
        // 初始加载时检查是否已有 staff 回复
        if (thinking.value && res.messages.some(m => m.role === 'staff')) {
          thinking.value = false
        }
      } else {
        appendMessages(res.messages)
      }
      if (open.value) {
        unread.value = 0
        if (latestId.value) {
          lastSeenId.value = latestId.value
          writeLastSeen(latestId.value)
        }
      } else if (latestId.value && lastSeenId.value === latestId.value) {
        unread.value = 0
      } else {
        unread.value = res.unread
      }
      error.value = null
    } catch (e) {
      error.value = e instanceof Error ? e.message : '拉取消息失败'
    }
  }

  async function send(content: string) {
    const trimmed = content.trim()
    if (!trimmed) return
    const id = userId.value
    if (!id) return
    sending.value = true
    thinking.value = true
    error.value = null
    pendingDraft.value = null
    try {
      const res = await sendSupportMessage(id, trimmed)
      appendMessages([res.message])
      if (res.draft) {
        pendingDraft.value = res.draft
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '发送失败'
      thinking.value = false
      throw e
    } finally {
      sending.value = false
    }
  }

  function clearDraft() {
    pendingDraft.value = null
  }

  async function flushRead() {
    const id = userId.value
    const lastId = latestId.value
    if (!id || !lastId) return
    if (lastSeenId.value === lastId) {
      unread.value = 0
      return
    }
    try {
      await markSupportRead(id, lastId)
      lastSeenId.value = lastId
      writeLastSeen(lastId)
      unread.value = 0
    } catch {}
  }

  function clearTimer() {
    if (!import.meta.client) return
    if (pollHandle.value.id !== null) {
      window.clearTimeout(pollHandle.value.id)
      pollHandle.value.id = null
    }
  }

  function scheduleNext() {
    if (!import.meta.client) return
    clearTimer()
    if (typeof document !== 'undefined' && document.hidden) return
    const interval = open.value ? POLL_OPEN_MS : POLL_CLOSED_MS
    pollHandle.value.id = window.setTimeout(async () => {
      await pull()
      scheduleNext()
    }, interval)
  }

  function startPolling() {
    if (!import.meta.client) return
    pull().then(scheduleNext)
  }

  function stopPolling() {
    clearTimer()
  }

  function onVisibilityChange() {
    if (document.hidden) {
      clearTimer()
    } else {
      startPolling()
    }
  }

  function bindVisibility() {
    if (!import.meta.client) return
    document.addEventListener('visibilitychange', onVisibilityChange)
  }

  function unbindVisibility() {
    if (!import.meta.client) return
    document.removeEventListener('visibilitychange', onVisibilityChange)
  }

  function openPanel() {
    open.value = true
    unread.value = 0
    flushRead()
    clearTimer()
    scheduleNext()
  }

  function closePanel() {
    open.value = false
    clearTimer()
    scheduleNext()
  }

  function togglePanel() {
    if (open.value) closePanel()
    else openPanel()
  }

  return {
    messages,
    latestId,
    unread,
    open,
    sending,
    thinking,
    error,
    pendingDraft,
    send,
    pull,
    clearDraft,
    openPanel,
    closePanel,
    togglePanel,
    startPolling,
    stopPolling,
    bindVisibility,
    unbindVisibility,
  }
}

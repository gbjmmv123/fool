import type { StaffConversation, SupportMessage } from '~/types/support'
import { listStaffConversations, pullStaffMessages, sendStaffReply } from '~/services/staff'

const POLL_MS = 4000

export function useStaffConsole() {
  const conversations = useState<StaffConversation[]>('church-staff-convs', () => [])
  const activeUserId = useState<string | null>('church-staff-active', () => null)
  const messages = useState<SupportMessage[]>('church-staff-msgs', () => [])
  const latestMsgId = useState<string | null>('church-staff-latest-msg', () => null)
  const sending = useState<boolean>('church-staff-sending', () => false)
  const error = useState<string | null>('church-staff-error', () => null)
  const pendingDraft = useState<string | null>('church-staff-draft', () => null)
  const pollHandle = useState<{ list: number | null; msgs: number | null }>(
    'church-staff-poll',
    () => ({ list: null, msgs: null }),
  )

  async function loadList() {
    try {
      const res = await listStaffConversations()
      conversations.value = [...res.conversations].sort((a, b) => {
        if (a.needsReply !== b.needsReply) return a.needsReply ? -1 : 1
        return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      })

      // 如果当前活跃会话有 pendingDraft，同步到 draft 状态
      syncPendingDraft()
    } catch (e) {
      error.value = e instanceof Error ? e.message : '加载会话失败'
    }
  }

  function syncPendingDraft() {
    const uid = activeUserId.value
    if (!uid) {
      pendingDraft.value = null
      return
    }
    const conv = conversations.value.find((c) => c.userId === uid)
    pendingDraft.value = conv?.pendingDraft ?? null
  }

  function appendMessages(incoming: SupportMessage[]) {
    if (incoming.length === 0) return
    const seen = new Set(messages.value.map((m) => m.id))
    const fresh = incoming.filter((m) => !seen.has(m.id))
    if (fresh.length === 0) return
    messages.value = [...messages.value, ...fresh]
    latestMsgId.value = messages.value[messages.value.length - 1]!.id
  }

  async function loadMessages(reset = false) {
    const uid = activeUserId.value
    if (!uid) return
    try {
      const sinceId = reset ? undefined : (latestMsgId.value ?? undefined)
      const res = await pullStaffMessages(uid, sinceId)
      if (reset) {
        messages.value = res.messages
        latestMsgId.value = res.latestId
      } else {
        appendMessages(res.messages)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '加载消息失败'
    }
  }

  function selectConversation(userId: string) {
    activeUserId.value = userId
    messages.value = []
    latestMsgId.value = null
    syncPendingDraft()
    loadMessages(true)
    clearMsgTimer()
    scheduleMsgPoll()
  }

  async function reply(content: string) {
    const uid = activeUserId.value
    if (!uid || !content.trim()) return
    sending.value = true
    error.value = null
    try {
      const res = await sendStaffReply(uid, content.trim())
      appendMessages([res.message])
      // 清除草稿
      pendingDraft.value = null
      // 更新会话列表
      const idx = conversations.value.findIndex((c) => c.userId === uid)
      if (idx !== -1) {
        const updated = { ...conversations.value[idx]!, needsReply: false, lastMessageRole: 'staff' as const, pendingDraft: null }
        const newList = [...conversations.value]
        newList[idx] = updated
        conversations.value = newList.sort((a, b) => {
          if (a.needsReply !== b.needsReply) return a.needsReply ? -1 : 1
          return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        })
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '发送失败'
      throw e
    } finally {
      sending.value = false
    }
  }

  function clearDraft() {
    pendingDraft.value = null
  }

  function clearListTimer() {
    if (!import.meta.client) return
    if (pollHandle.value.list !== null) {
      window.clearTimeout(pollHandle.value.list)
      pollHandle.value.list = null
    }
  }

  function clearMsgTimer() {
    if (!import.meta.client) return
    if (pollHandle.value.msgs !== null) {
      window.clearTimeout(pollHandle.value.msgs)
      pollHandle.value.msgs = null
    }
  }

  function scheduleListPoll() {
    if (!import.meta.client) return
    clearListTimer()
    if (typeof document !== 'undefined' && document.hidden) return
    pollHandle.value.list = window.setTimeout(async () => {
      await loadList()
      scheduleListPoll()
    }, POLL_MS)
  }

  function scheduleMsgPoll() {
    if (!import.meta.client) return
    clearMsgTimer()
    if (typeof document !== 'undefined' && document.hidden) return
    if (!activeUserId.value) return
    pollHandle.value.msgs = window.setTimeout(async () => {
      await loadMessages(false)
      scheduleMsgPoll()
    }, POLL_MS)
  }

  function startPolling() {
    if (!import.meta.client) return
    loadList().then(scheduleListPoll)
    if (activeUserId.value) {
      scheduleMsgPoll()
    }
  }

  function stopPolling() {
    clearListTimer()
    clearMsgTimer()
  }

  function onVisibilityChange() {
    if (document.hidden) {
      stopPolling()
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

  return {
    conversations,
    activeUserId,
    messages,
    sending,
    error,
    pendingDraft,
    loadList,
    loadMessages,
    selectConversation,
    reply,
    clearDraft,
    startPolling,
    stopPolling,
    bindVisibility,
    unbindVisibility,
  }
}

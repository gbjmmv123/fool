import { requestArrodesDraft } from '~/services/staff'
import { buildArrodesSystemPrompt, buildArrodesMessages, isFirstInteraction } from '~/utils/arrodesPrompt'
import type { SupportMessage } from '~/types/support'

export function useArrodesDraft() {
  const drafting = ref(false)
  const draft = ref<string | null>(null)
  const error = ref<string | null>(null)

  /**
   * 请求 AI 生成阿罗德斯回复草稿
   * @param userId 目标用户 ID
   * @param messages 当前会话的全部消息
   * @param isLastOfHour 是否为本小时最后一次（前端控制）
   */
  async function generateDraft(userId: string, messages: SupportMessage[], isLastOfHour = false) {
    drafting.value = true
    draft.value = null
    error.value = null

    try {
      const first = isFirstInteraction(messages)
      const systemPrompt = buildArrodesSystemPrompt({
        isFirstInteraction: first,
        isLastOfHour,
      })
      const chatMessages = buildArrodesMessages(messages, userId)

      const res = await requestArrodesDraft({
        userId,
        systemPrompt,
        messages: chatMessages,
      })

      draft.value = res.draft
      return res.draft
    } catch (e) {
      const msg = e instanceof Error ? e.message : '生成草稿失败'
      error.value = msg
      throw e
    } finally {
      drafting.value = false
    }
  }

  function clearDraft() {
    draft.value = null
    error.value = null
  }

  return {
    drafting,
    draft,
    error,
    generateDraft,
    clearDraft,
  }
}

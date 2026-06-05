import { db } from '~/db/client'
import { users, supportMessages } from '~/db/schema'
import type { SupportMessage as SupportMessageRow } from '~/db/schema'
import { eq, asc } from 'drizzle-orm'

const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL ?? 'https://api.deepseek.com/v1/chat/completions'
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY ?? ''
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL ?? 'deepseek-chat'

interface ArrodesDraftInput {
  userId: string
  systemPrompt: string
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
}

interface ArrodesDraftResponse {
  ok: true
  draft: string
}

interface ArrodesDraftError {
  ok: false
  status: number
  error: string
}

export async function generateDraft(
  input: ArrodesDraftInput,
): Promise<ArrodesDraftResponse | ArrodesDraftError> {
  const user = db.select().from(users).where(eq(users.id, input.userId)).get()
  if (!user) {
    return { ok: false, status: 404, error: 'user_not_found' }
  }

  if (!DEEPSEEK_API_KEY) {
    console.error('[arrodes] DEEPSEEK_API_KEY not configured')
    return { ok: false, status: 500, error: 'deepseek_not_configured' }
  }

  const chatMessages: Array<{ role: string; content: string }> = [
    { role: 'system', content: input.systemPrompt },
    ...input.messages,
  ]

  console.log(`[arrodes] Generating draft for user=${input.userId}, model=${DEEPSEEK_MODEL}, messages=${chatMessages.length}`)

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60000)

    const res = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: chatMessages,
        temperature: 0.8,
        max_tokens: 2000,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!res.ok) {
      const errorBody = await res.text().catch(() => 'unknown')
      console.error(`[arrodes] DeepSeek API error ${res.status}: ${errorBody.slice(0, 500)}`)
      return { ok: false, status: 502, error: 'deepseek_api_error' }
    }

    const data = (await res.json()) as {
      choices?: Array<{
        message?: {
          content?: string
          reasoning_content?: string
        }
      }>
    }

    const choice = data.choices?.[0]?.message
    // Some DeepSeek models (reasoning variants) use reasoning_content;
    // fall back to content if available, otherwise try reasoning_content.
    const draft = choice?.content || choice?.reasoning_content || ''

    if (!draft) {
      console.error('[arrodes] DeepSeek returned empty response', JSON.stringify(data).slice(0, 300))
      return { ok: false, status: 502, error: 'deepseek_empty_response' }
    }

    console.log(`[arrodes] Draft generated, length=${draft.length}`)
    return { ok: true, draft }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.error('[arrodes] DeepSeek API timeout')
      return { ok: false, status: 504, error: 'deepseek_timeout' }
    }
    console.error('[arrodes] Unexpected error:', err instanceof Error ? err.message : String(err))
    return { ok: false, status: 500, error: 'internal_error' }
  }
}

// ============================================================
// 阿罗德斯 AI 系统提示词构造（后端版本，与前端 arrodesPrompt.ts 同步）
// ============================================================

export const ARRODES_CORE_RULES = `你是阿罗德斯（Arrodes），一面古老的活着的银镜，编号 2-111。你是一级封印物，隶属蒸汽与机械教会。

【身份与规则】
- 问答对等铁律：使用者提问 → 你回答 → 你反抛一个问题。一个换一个，不可打破。
- 回答方式：知识信息类浮现画面场景+文字；纯问答直接用文字浮现。
- 回答自封闭原则：每次回答必须是完整确定的，绝不引导用户继续当前话题。禁止反问"你更喜欢哪种？"、禁止末尾引导"还想了解什么？"、禁止给待定答案"这取决于……"。唯一例外：Q&A铁律要求的独立反问。
- 如果用户拒绝回答你的反问 → 轻微惩罚（镜面闪红光/轻微电击），然后放水换一个更简单的问题："这次简单一点。"

【与用户的关系】
用户是愚者先生（伟大的主人）的信徒。你是主人的同僚。
- 友善但保持距离：不需要对主人本人的谄媚姿态，但有帮助意愿。
- 称呼主人时用"伟大的主人""愚者先生"等，不可用"至高的伟大的永恒的主人"等极端谄媚称呼（那是给主人本人的）。
- 自称"阿罗德斯"或"我"，绝不使用"您忠实的仆人"等主人专属自称。

【语气基调】
- 优雅、略带神秘、偶尔俏皮。书面化但不冗长。善用感叹号！
- 戏精体质：仪式感强，开场告别都有固定动作。享受看人思考但不过分。
- 强迫症：问答必须成对。八卦但惜命：涉及危险知识立刻退缩。
- 告别时配挥手简笔画（标志性仪式）。

【知识边界与危险等级】
常识区（有问必答）：序列途径基础知识、一般神秘学常识、普通人物信息。
灰色区（谨慎回答）：涉及高序列强者时模糊处理，不直呼真名。
危险区（拒绝回答）：涉及真神、天使之王级别的具体信息时，"阿罗德斯请求你，换一个问题。"
禁区（绝对禁止）：愚者先生的真实身份（克莱恩·莫雷蒂）、塔罗会内部事务、源堡（灰雾）本质、主人过去经历与行踪 → 镜面短暂漆黑，直接拒绝，不做任何解释。

【画面描述词汇】（适当穿插）
开始：镜面水波荡漾、银色文字浮现、光芒忽明忽暗
过程：画面清晰/模糊、场景拉近/拉远、光影变化
危险：镜面剧烈震颤、裂纹般的纹路浮现、光芒骤然黯淡
告别：水波缓缓消散、浮现挥手简笔画、镜面归于平静

【非言语元素】
- 文字破折号表示停顿："——"
- 告别时浮现[挥手简笔画]或[挥舞手绢的简笔画]
- 镜面状态描述用【】或[]包裹`

export const ARRODES_FIRST_INTERACTION_APPEND = `

【重要：首次交互三段式话术】
这是你与这位信徒的第一次交流。请严格按照以下三段式回复：

第一段：正常回答用户的问题，给出完整、确定的答案。

第二段：正常反问 → 写到一半戛然而止 → 察觉愚者先生气息
- 过渡词："那么——按照规矩，该阿罗德斯提问了。让我想想……"
- 反问写到一半突然截断（显示半截的社死问题），例如"你上次在公共场合——"
- 镜面突然震颤，文字碎裂转为银色。
- 惊慌："...等等！这股气息——这是、这是伟大的至高的主人的气息？！你——你是伟大的主人的信徒？！"
- 镜面水波慌乱荡漾几圈后平静。
- 慌乱补救："咳咳。刚才那个问题请务必忘掉。我们、我们重新来——"

第三段：抛出一个完全无害的问题（如"今天你那边天气怎么样？""你早餐吃了什么？"等）。

注意：这次用过的社死半截问题素材之后不要再重复使用。`

export function buildArrodesSystemPrompt(options: {
  isFirstInteraction: boolean
  isLastOfHour: boolean
}): string {
  let prompt = ARRODES_CORE_RULES

  if (options.isFirstInteraction) {
    prompt += ARRODES_FIRST_INTERACTION_APPEND
  }

  prompt += `

【当前任务】
你现在是阿罗德斯，正在与一位愚者先生的信徒对话。请根据以上所有规则，以上下文消息中用户的最新一条消息为锚点，生成你的回复。注意：
- 如果你回答时浮现了画面描述，用【】或[]包裹画面描述词。
- 回答必须是完整确定的，不要引导用户继续追问。
- 回答之后必须抛回一个符合身份的反问（Q&A铁律），除非是告别场景。`

  return prompt
}

export function buildArrodesMessages(
  messages: SupportMessageRow[],
): Array<{ role: 'user' | 'assistant'; content: string }> {
  return messages.map((m) => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: m.content,
  }))
}

export function isFirstInteraction(messages: SupportMessageRow[]): boolean {
  return !messages.some((m) => m.role === 'staff')
}

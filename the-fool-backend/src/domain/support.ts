import { and, eq, gt, asc, desc, sql } from 'drizzle-orm'
import { db } from '~/db/client'
import { users, supportConversations, supportMessages } from '~/db/schema'
import type { SupportMessage as SupportMessageRow } from '~/db/schema'
import { generateSupportMessageId } from '~/utils/ids'
import { nowMs, toIsoString } from '~/utils/time'
import type { SupportMessageDTO, StaffConversationDTO } from '~/types/api'
import {
  generateDraft,
  buildArrodesSystemPrompt,
  buildArrodesMessages,
  isFirstInteraction,
} from '~/domain/arrodes'

const DEFAULT_PULL_LIMIT = 50

function toDto(row: SupportMessageRow): SupportMessageDTO {
  return {
    id: row.id,
    role: row.role,
    content: row.content,
    createdAt: toIsoString(row.createdAt),
  }
}

function ensureConversation(userId: string): typeof supportConversations.$inferSelect {
  const existing = db
    .select()
    .from(supportConversations)
    .where(eq(supportConversations.userId, userId))
    .get()
  if (existing) return existing

  const now = nowMs()
  const inserted: typeof supportConversations.$inferInsert = {
    userId,
    unreadByUser: 0,
    lastMessageRole: null,
    lastMessageAt: now,
    createdAt: now,
  }
  db.insert(supportConversations).values(inserted).run()
  return inserted as typeof supportConversations.$inferSelect
}

// ============================================================
// 用户发送消息 → 存 DB → AI 生成草稿 → 草稿存到 conversation.pendingDraft
// 不自动发送给用户，等待管理端人工审核后发送
// ============================================================
export async function sendUserMessage(
  userId: string,
  content: string,
):
  Promise<
    | { ok: true; message: SupportMessageDTO; draft?: string }
    | { ok: false; status: number; error: string }
  > {
  const user = db.select().from(users).where(eq(users.id, userId)).get()
  if (!user) {
    return { ok: false, status: 404, error: 'user_not_found' }
  }

  ensureConversation(userId)

  const now = nowMs()
  const id = generateSupportMessageId()
  const row: typeof supportMessages.$inferInsert = {
    id,
    userId,
    role: 'user',
    content,
    createdAt: now,
  }
  db.insert(supportMessages).values(row).run()
  db.update(supportConversations)
    .set({ lastMessageAt: now, lastMessageRole: 'user' })
    .where(eq(supportConversations.userId, userId))
    .run()

  const userMessage = toDto({ ...row, role: 'user' } as SupportMessageRow)

  // AI 生成草稿，存入 pendingDraft 供管理端使用
  try {
    const allMessages = db
      .select()
      .from(supportMessages)
      .where(eq(supportMessages.userId, userId))
      .orderBy(asc(supportMessages.createdAt))
      .all()

    const first = isFirstInteraction(allMessages)
    const systemPrompt = buildArrodesSystemPrompt({
      isFirstInteraction: first,
      isLastOfHour: false,
    })
    const chatMessages = buildArrodesMessages(allMessages)

    const draftResult = await generateDraft({
      userId,
      systemPrompt,
      messages: chatMessages,
    })

    if (draftResult.ok && draftResult.draft) {
      db.update(supportConversations)
        .set({ pendingDraft: draftResult.draft })
        .where(eq(supportConversations.userId, userId))
        .run()
      return { ok: true, message: userMessage, draft: draftResult.draft }
    }
  } catch (err) {
    console.error('[support] AI draft failed:', err instanceof Error ? err.message : String(err))
  }

  return { ok: true, message: userMessage }
}

// ============================================================
// 管理端发送回复 → 存为 staff 消息 → 清除 pendingDraft
// ============================================================
export function sendStaffMessage(
  userId: string,
  content: string,
):
  | { ok: true; message: SupportMessageDTO }
  | { ok: false; status: number; error: string } {
  const user = db.select().from(users).where(eq(users.id, userId)).get()
  if (!user) {
    return { ok: false, status: 404, error: 'user_not_found' }
  }

  const conv = ensureConversation(userId)

  const now = nowMs()
  const id = generateSupportMessageId()
  const row: typeof supportMessages.$inferInsert = {
    id,
    userId,
    role: 'staff',
    content,
    createdAt: now,
  }
  db.insert(supportMessages).values(row).run()
  db.update(supportConversations)
    .set({
      lastMessageAt: now,
      lastMessageRole: 'staff',
      unreadByUser: (conv.unreadByUser ?? 0) + 1,
      pendingDraft: null,
    })
    .where(eq(supportConversations.userId, userId))
    .run()

  return { ok: true, message: toDto({ ...row, role: 'staff' } as SupportMessageRow) }
}

// ============================================================
// 管理端：列出所有会话，包含 pendingDraft
// ============================================================
export function listConversations(): StaffConversationDTO[] {
  const convs = db
    .select({
      userId: supportConversations.userId,
      lastMessageAt: supportConversations.lastMessageAt,
      lastMessageRole: supportConversations.lastMessageRole,
      pendingDraft: supportConversations.pendingDraft,
      nickname: users.nickname,
    })
    .from(supportConversations)
    .leftJoin(users, eq(users.id, supportConversations.userId))
    .orderBy(desc(supportConversations.lastMessageAt))
    .all()

  if (convs.length === 0) return []

  const lastMsgRows = db
    .select({
      userId: supportMessages.userId,
      content: supportMessages.content,
    })
    .from(supportMessages)
    .where(
      sql`(${supportMessages.userId}, ${supportMessages.createdAt}) IN (
            SELECT user_id, MAX(created_at) FROM support_messages GROUP BY user_id
          )`,
    )
    .all()

  const lastMsgByUser = new Map<string, string>()
  for (const row of lastMsgRows) lastMsgByUser.set(row.userId, row.content)

  return convs.map((conv) => {
    const content = lastMsgByUser.get(conv.userId) ?? ''
    const preview = content.length > 60 ? content.slice(0, 60) + '…' : content
    return {
      userId: conv.userId,
      nickname: conv.nickname ?? null,
      lastMessageAt: toIsoString(conv.lastMessageAt),
      lastMessageRole: conv.lastMessageRole ?? null,
      lastMessagePreview: preview,
      needsReply: conv.lastMessageRole === 'user',
      pendingDraft: conv.pendingDraft ?? null,
    }
  })
}

export function pullMessages(
  userId: string,
  sinceId?: string,
): { messages: SupportMessageDTO[]; latestId: string | null; unread: number } {
  let sinceCreatedAt = -1
  if (sinceId) {
    const since = db
      .select()
      .from(supportMessages)
      .where(and(eq(supportMessages.userId, userId), eq(supportMessages.id, sinceId)))
      .get()
    if (since) sinceCreatedAt = since.createdAt
  }

  let rows: SupportMessageRow[]
  if (sinceCreatedAt >= 0) {
    rows = db
      .select()
      .from(supportMessages)
      .where(
        and(eq(supportMessages.userId, userId), gt(supportMessages.createdAt, sinceCreatedAt)),
      )
      .orderBy(asc(supportMessages.createdAt))
      .all()
  } else {
    const recent = db
      .select()
      .from(supportMessages)
      .where(eq(supportMessages.userId, userId))
      .orderBy(desc(supportMessages.createdAt))
      .limit(DEFAULT_PULL_LIMIT)
      .all()
    rows = recent.reverse()
  }

  const conv = db
    .select()
    .from(supportConversations)
    .where(eq(supportConversations.userId, userId))
    .get()

  return {
    messages: rows.map(toDto),
    latestId: rows.length > 0 ? rows[rows.length - 1]!.id : null,
    unread: conv?.unreadByUser ?? 0,
  }
}

export function getUnread(userId: string): number {
  const conv = db
    .select()
    .from(supportConversations)
    .where(eq(supportConversations.userId, userId))
    .get()
  return conv?.unreadByUser ?? 0
}

export function markRead(userId: string, upToId: string): void {
  const upTo = db
    .select()
    .from(supportMessages)
    .where(and(eq(supportMessages.userId, userId), eq(supportMessages.id, upToId)))
    .get()
  if (!upTo) return

  const conv = db
    .select()
    .from(supportConversations)
    .where(eq(supportConversations.userId, userId))
    .get()
  if (!conv) return

  const laterStaff = db
    .select({ c: sql<number>`COUNT(*)` })
    .from(supportMessages)
    .where(
      and(
        eq(supportMessages.userId, userId),
        eq(supportMessages.role, 'staff'),
        gt(supportMessages.createdAt, upTo.createdAt),
      ),
    )
    .get()
  const remaining = laterStaff?.c ?? 0

  db.update(supportConversations)
    .set({ unreadByUser: remaining })
    .where(eq(supportConversations.userId, userId))
    .run()
}

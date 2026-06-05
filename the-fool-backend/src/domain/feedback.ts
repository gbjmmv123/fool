import { desc } from 'drizzle-orm'
import { db } from '~/db/client'
import { errorFeedbacks } from '~/db/schema'
import { generateFeedbackId } from '~/utils/ids'
import { nowMs, toIsoString } from '~/utils/time'
import type { FeedbackItem } from '~/types/api'

export function submitFeedback(userId: string | undefined, content: string): void {
  db.insert(errorFeedbacks).values({
    id: generateFeedbackId(),
    userId: userId ?? null,
    content,
    createdAt: nowMs(),
  }).run()
}

export function listFeedbacks(): FeedbackItem[] {
  return db
    .select()
    .from(errorFeedbacks)
    .orderBy(desc(errorFeedbacks.createdAt))
    .all()
    .map((row) => ({
      id: row.id,
      userId: row.userId,
      content: row.content,
      createdAt: toIsoString(row.createdAt),
    }))
}

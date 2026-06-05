import { eq } from 'drizzle-orm'
import { db } from '~/db/client'
import { users, departments } from '~/db/schema'
import { nowMs } from '~/utils/time'
import type { HomepageMessageType, UserBootstrapState } from '~/types/api'

export function getOrCreateUser(userId: string): { user: typeof users.$inferSelect; isNewUser: boolean } {
  const existing = db.select().from(users).where(eq(users.id, userId)).get()
  if (existing) return { user: existing, isNewUser: false }

  const now = nowMs()
  const inserted: typeof users.$inferInsert = {
    id: userId,
    nickname: null,
    joinedAmon: false,
    departmentId: null,
    latestResultId: null,
    createdAt: now,
    updatedAt: now,
  }
  db.insert(users).values(inserted).run()
  return { user: { ...inserted, joinedAmon: false } as typeof users.$inferSelect, isNewUser: true }
}

export function deriveHomepageMessageType(opts: {
  nickname: string | null
  hasCompletedExam: boolean
}): HomepageMessageType {
  if (!opts.nickname) return 'name'
  if (!opts.hasCompletedExam) return 'urge_exam'
  return 'welcome_back'
}

export function buildBootstrapState(userId: string): UserBootstrapState {
  const { user, isNewUser } = getOrCreateUser(userId)

  const hasCompletedExam = !!user.latestResultId
  const hasDepartment = !!user.departmentId

  let departmentName: string | null = null
  if (user.departmentId) {
    const dept = db.select().from(departments).where(eq(departments.id, user.departmentId)).get()
    departmentName = dept?.name ?? null
  }

  return {
    userId: user.id,
    nickname: user.nickname,
    isNewUser,
    hasCompletedExam,
    hasDepartment,
    departmentId: user.departmentId,
    departmentName,
    joinedAmonFamily: !!user.joinedAmon,
    latestExamResultId: user.latestResultId,
    homepageMessageType: deriveHomepageMessageType({
      nickname: user.nickname,
      hasCompletedExam,
    }),
  }
}

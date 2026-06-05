import { eq } from 'drizzle-orm'
import { db } from '~/db/client'
import { users, departments, examResults } from '~/db/schema'
import { generateResultId } from '~/utils/ids'
import { nowMs, toIsoString } from '~/utils/time'
import type { ExamSubmitResponse, TransferCard } from '~/types/api'

export interface SubmitExamInput {
  userId: string
  assignedDepartmentId: string
  storyId: 1 | 2 | 3
  amonTriggered: boolean
}

function appendAmonSuffix(nickname: string | null): string | null {
  if (!nickname) return null
  return nickname.includes('·阿蒙') ? nickname : `${nickname}·阿蒙`
}

export function submitExam(
  input: SubmitExamInput,
): { ok: true; payload: ExamSubmitResponse } | { ok: false; status: number; error: string } {
  const user = db.select().from(users).where(eq(users.id, input.userId)).get()
  if (!user) return { ok: false, status: 404, error: 'user_not_found' }

  const assignedDept = db
    .select()
    .from(departments)
    .where(eq(departments.id, input.assignedDepartmentId))
    .get()
  if (!assignedDept) return { ok: false, status: 404, error: 'department_not_found' }

  const previousDepartmentId = user.departmentId ?? null
  const needsTransfer =
    !!previousDepartmentId && previousDepartmentId !== input.assignedDepartmentId

  let fromDept: { id: string; name: string } | undefined
  if (needsTransfer && previousDepartmentId) {
    const prev = db
      .select()
      .from(departments)
      .where(eq(departments.id, previousDepartmentId))
      .get()
    fromDept = prev ? { id: prev.id, name: prev.name } : undefined
  }

  const resultId = generateResultId()
  const now = nowMs()
  const shouldJoinAmon = !!user.joinedAmon || input.amonTriggered
  const newNickname = shouldJoinAmon ? appendAmonSuffix(user.nickname) : user.nickname

  db.transaction((tx) => {
    tx
      .insert(examResults)
      .values({
        id: resultId,
        userId: user.id,
        assignedDepartmentId: input.assignedDepartmentId,
        previousDepartmentId,
        storyId: input.storyId,
        amonTriggered: input.amonTriggered,
        joinedAt: toIsoString(now),
        createdAt: now,
      })
      .run()

    tx
      .update(users)
      .set({
        latestResultId: resultId,
        departmentId: needsTransfer ? previousDepartmentId : input.assignedDepartmentId,
        joinedAmon: shouldJoinAmon,
        nickname: newNickname,
        updatedAt: now,
      })
      .where(eq(users.id, user.id))
      .run()
  })

  const payload: ExamSubmitResponse = {
    resultId,
    storyId: input.storyId,
    amonTriggered: input.amonTriggered,
  }

  if (needsTransfer && fromDept) {
    const transferCard: TransferCard = {
      show: true,
      from: fromDept,
      to: { id: assignedDept.id, name: assignedDept.name },
    }
    payload.transferCard = transferCard
  }

  return { ok: true, payload }
}

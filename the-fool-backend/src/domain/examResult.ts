import { eq } from 'drizzle-orm'
import { db } from '~/db/client'
import { users, departments, examResults } from '~/db/schema'
import type { ExamResultResponse, ExamResultDetail } from '~/types/api'

export function buildExamResult(input: {
  userId: string
  resultId: string
  simulatePreparing?: boolean
}):
  | { ok: true; payload: ExamResultResponse }
  | { ok: false; status: number; error: string } {

  const result = db.select().from(examResults)
    .where(eq(examResults.id, input.resultId)).get()

  if (!result) return { ok: false, status: 404, error: 'result_not_found' }
  if (result.userId !== input.userId) {
    return { ok: false, status: 403, error: 'result_forbidden' }
  }

  const user = db.select().from(users).where(eq(users.id, input.userId)).get()
  if (!user) return { ok: false, status: 404, error: 'user_not_found' }

  const dept = db.select().from(departments)
    .where(eq(departments.id, result.assignedDepartmentId)).get()
  if (!dept) return { ok: false, status: 500, error: 'department_missing' }

  const detail: ExamResultDetail = {
    nickname: user.nickname ?? '匿名探索者',
    joinedAt: result.joinedAt,
  }

  const needsTransfer =
    !!result.previousDepartmentId &&
    result.previousDepartmentId !== result.assignedDepartmentId &&
    user.departmentId === result.previousDepartmentId

  const payload: ExamResultResponse = {
    loadingState: input.simulatePreparing ? 'preparing' : 'done',
    storyId: result.storyId as 1 | 2 | 3,
    amonTriggered: !!result.amonTriggered,
    assignedDepartmentId: dept.id,
    assignedDepartmentName: dept.name,
    detail,
  }

  if (needsTransfer) {
    payload.transferCard = {
      show: true,
      targetDepartmentId: dept.id,
      targetDepartmentName: dept.name,
    }
  }

  return { ok: true, payload }
}

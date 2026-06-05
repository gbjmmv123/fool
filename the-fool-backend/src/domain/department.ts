import { eq, asc, sql } from 'drizzle-orm'
import { db } from '~/db/client'
import { users, departments, examResults } from '~/db/schema'
import type { DepartmentDetail, DepartmentMember, MyDepartmentResponse } from '~/types/api'
import { nowMs } from '~/utils/time'

const MEMBER_PREVIEW = 12

function toDetail(
  dept: typeof departments.$inferSelect,
  members: DepartmentMember[],
  memberCount: number,
): DepartmentDetail {
  return {
    id: dept.id,
    name: dept.name,
    members,
    memberCount,
  }
}

function loadMembers(deptId: string, limit?: number): DepartmentMember[] {
  const query = db
    .select({ userId: users.id, nickname: users.nickname, joinedAt: examResults.joinedAt })
    .from(users)
    .leftJoin(examResults, eq(examResults.id, users.latestResultId))
    .where(eq(users.departmentId, deptId))
    .orderBy(asc(examResults.createdAt))

  const rows = limit !== undefined ? query.limit(limit).all() : query.all()

  return rows.map((r) => ({
    userId: r.userId,
    nickname: r.nickname ?? '匿名探索者',
    joinedAt: r.joinedAt ?? '',
  }))
}

function countMembers(deptId: string): number {
  const r = db
    .select({ c: sql<number>`COUNT(*)` })
    .from(users)
    .where(eq(users.departmentId, deptId))
    .get()
  return r?.c ?? 0
}

export function loadMyDepartment(userId: string): MyDepartmentResponse {
  const user = db.select().from(users).where(eq(users.id, userId)).get()
  if (!user || !user.latestResultId) return { status: 'no_exam' }
  if (!user.departmentId) return { status: 'pending_assignment' }

  const dept = db.select().from(departments)
    .where(eq(departments.id, user.departmentId)).get()
  if (!dept) return { status: 'pending_assignment' }

  const result = db.select().from(examResults)
    .where(eq(examResults.id, user.latestResultId)).get()

  return {
    status: 'assigned',
    department: toDetail(dept, loadMembers(dept.id, MEMBER_PREVIEW), countMembers(dept.id)),
    examSummary: result ? { resultId: result.id, joinedAt: result.joinedAt } : undefined,
  }
}

export function loadAllDepartments(): { departments: DepartmentDetail[] } {
  const depts = db.select().from(departments).orderBy(asc(departments.sortOrder)).all()
  return {
    departments: depts.map((dept) =>
      toDetail(dept, loadMembers(dept.id), countMembers(dept.id)),
    ),
  }
}

export function joinDepartmentTx(input: {
  userId: string
  targetDepartmentId: string
}):
  | { ok: true }
  | { ok: false; status: number; error: string } {

  const user = db.select().from(users).where(eq(users.id, input.userId)).get()
  if (!user) return { ok: false, status: 404, error: 'user_not_found' }

  const dept = db.select().from(departments)
    .where(eq(departments.id, input.targetDepartmentId)).get()
  if (!dept) return { ok: false, status: 404, error: 'department_not_found' }

  if (!user.latestResultId) {
    return { ok: false, status: 409, error: 'exam_required' }
  }

  db.update(users)
    .set({ departmentId: dept.id, updatedAt: nowMs() })
    .where(eq(users.id, user.id))
    .run()

  return { ok: true }
}

import { eq } from 'drizzle-orm'
import { db } from '~/db/client'
import { users } from '~/db/schema'
import { nowMs } from '~/utils/time'
import type { AmonMember } from '~/types/api'

function appendAmonSuffix(nickname: string | null): string | null {
  if (!nickname) return null
  return nickname.includes('·阿蒙') ? nickname : `${nickname}·阿蒙`
}

function removeAmonSuffix(nickname: string | null): string | null {
  if (!nickname) return null
  return nickname.replace(/·阿蒙$/, '')
}

export function loadAmonMembers(): { members: AmonMember[] } {
  const rows = db
    .select({
      userId: users.id,
      nickname: users.nickname,
      departmentId: users.departmentId,
      joinedAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.joinedAmon, true))
    .all()

  const members: AmonMember[] = rows.map((r) => ({
    userId: r.userId,
    nickname: r.nickname ?? '匿名探索者',
    departmentId: r.departmentId,
    joinedAt: r.joinedAt,
  }))

  return { members }
}

export function joinAmonTx(input: {
  userId: string
}):
  | { ok: true }
  | { ok: false; status: number; error: string } {

  const user = db.select().from(users).where(eq(users.id, input.userId)).get()
  if (!user) return { ok: false, status: 404, error: 'user_not_found' }

  if (user.joinedAmon) {
    return { ok: true } // already joined
  }

  const newNickname = appendAmonSuffix(user.nickname)

  db.update(users)
    .set({
      joinedAmon: true,
      nickname: newNickname,
      updatedAt: nowMs(),
    })
    .where(eq(users.id, user.id))
    .run()

  return { ok: true }
}

export function leaveAmonTx(input: {
  userId: string
}):
  | { ok: true }
  | { ok: false; status: number; error: string } {

  const user = db.select().from(users).where(eq(users.id, input.userId)).get()
  if (!user) return { ok: false, status: 404, error: 'user_not_found' }

  const newNickname = removeAmonSuffix(user.nickname)

  db.update(users)
    .set({
      joinedAmon: false,
      nickname: newNickname,
      updatedAt: nowMs(),
    })
    .where(eq(users.id, user.id))
    .run()

  return { ok: true }
}

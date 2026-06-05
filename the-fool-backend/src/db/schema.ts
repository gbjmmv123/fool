import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  nickname: text('nickname'),
  joinedAmon: integer('joined_amon', { mode: 'boolean' }).notNull().default(false),
  departmentId: text('department_id'),
  latestResultId: text('latest_result_id'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
})

export const departments = sqliteTable('departments', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const examResults = sqliteTable(
  'exam_results',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    assignedDepartmentId: text('assigned_department_id').notNull(),
    previousDepartmentId: text('previous_department_id'),
    storyId: integer('story_id').notNull(),
    amonTriggered: integer('amon_triggered', { mode: 'boolean' }).notNull().default(false),
    joinedAt: text('joined_at').notNull(),
    createdAt: integer('created_at').notNull(),
  },
  (t) => ({
    userIdIdx: index('exam_results_user_id_idx').on(t.userId),
    createdAtIdx: index('exam_results_created_at_idx').on(t.createdAt),
  }),
)

export const supportConversations = sqliteTable('support_conversations', {
  userId: text('user_id').primaryKey(),
  unreadByUser: integer('unread_by_user').notNull().default(0),
  lastMessageRole: text('last_message_role', { enum: ['user', 'staff'] }),
  lastMessageAt: integer('last_message_at').notNull(),
  pendingDraft: text('pending_draft'),
  createdAt: integer('created_at').notNull(),
})

export const supportMessages = sqliteTable(
  'support_messages',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    role: text('role', { enum: ['user', 'staff'] }).notNull(),
    content: text('content').notNull(),
    createdAt: integer('created_at').notNull(),
  },
  (t) => ({
    userCreatedIdx: index('support_messages_user_created_idx').on(t.userId, t.createdAt),
  }),
)

export const errorFeedbacks = sqliteTable(
  'error_feedbacks',
  {
    id: text('id').primaryKey(),
    userId: text('user_id'),
    content: text('content').notNull(),
    createdAt: integer('created_at').notNull(),
  },
  (t) => ({
    createdAtIdx: index('error_feedbacks_created_at_idx').on(t.createdAt),
  }),
)

export type User = typeof users.$inferSelect
export type Department = typeof departments.$inferSelect
export type ExamResult = typeof examResults.$inferSelect
export type SupportConversation = typeof supportConversations.$inferSelect
export type SupportMessage = typeof supportMessages.$inferSelect
export type ErrorFeedback = typeof errorFeedbacks.$inferSelect

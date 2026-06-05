# 愚者教会后端

Node.js + Hono + better-sqlite3 + Drizzle ORM. Single-file SQLite, no auth, no monitoring.

## Tech Stack

| Category | Choice |
|---|---|
| Runtime | Node.js ≥ 20 |
| HTTP | Hono + `@hono/node-server` |
| ORM/DB | better-sqlite3 + Drizzle (sync API) |
| Validation | zod |
| Dev server | `tsx watch` |
| Build | `tsup` (ESM, target node20) |
| Env | `dotenv` |

Commands: `npm run dev` / `npm run build` / `npm run start` / `npm run typecheck` / `npm run db:reset`

## Architecture Rules

1. **Routes do IO only**: zod validation → call domain → translate response. No business logic in routes.
2. **Business logic lives in `domain/`**: Pure functions + sync DB calls. No Hono context dependency.
3. **DB schema is source of truth**: `db/schema.ts` defines tables. `types/api.ts` defines the external contract. They do NOT import each other.
4. **Time dual-track**: DB stores ms integers. API returns ISO strings via `new Date(ms).toISOString()`.
5. **Three error categories**: 4xx business error (domain returns `{ok:false}`) / 4xx validation error (zod) / 5xx true exception (throw → onError). Never `throw` for 4xx.
6. **CORS**: Explicit allow-origin list from `CORS_ORIGINS` (comma-separated), defaults to `http://localhost:3000`. Never use `*`.
7. **Drizzle uses sync API**: `.get()` / `.all()` / `.run()`.

## Directory Structure

```
src/
  index.ts          # Entry: dotenv → bootstrapDb → Hono serve
  app.ts            # createApp(): mounts routes, notFound, onError
  routes/           # health, bootstrap, user, exam, department, support, feedback
  domain/           # bootstrap, examSubmit, examResult, department, support, feedback
  db/               # client, schema, bootstrap (ensureSchema + ensureSeed), reset
  schemas/          # zod schemas (bootstrap, user, exam, department, support, feedback)
  types/api.ts      # External contract types (hand-written, no schema imports)
  utils/            # ids (result/support/feedback ID generation), time, cors
data/
  seed/departments.json   # 8 departments
  db.sqlite               # gitignored
```

## Database Schema (6 tables)

```ts
// users
id (TEXT PK)                 // uid_${ts}_${rand}, frontend-generated
nickname (TEXT, NULL)
joined_amon (INTEGER 0/1)    // false→true only, never reverts
department_id (TEXT, NULL)
latest_result_id (TEXT, NULL)
created_at / updated_at (INTEGER ms)

// departments (8 rows, seeded at startup)
id (TEXT PK)                 // justice|hangedman|sun|magician|moon|hermit|star|judgement
name (TEXT)
sort_order (INTEGER)

// exam_results
id (TEXT PK)                 // result_${ts36}_${rand6}, backend-generated
user_id (TEXT)
assigned_department_id (TEXT)
previous_department_id (TEXT, NULL)
story_id (INTEGER)           // 1=好呀好呀, 2=列奥德罗, 3=纸人替身
amon_triggered (INTEGER 0/1)
joined_at (TEXT ISO)
created_at (INTEGER ms)

// support_conversations
user_id (TEXT PK)
unread_by_user (INTEGER, default 0)
last_message_role (TEXT: 'user'|'staff', NULL)
last_message_at (INTEGER ms)
created_at (INTEGER ms)

// support_messages
id (TEXT PK)                 // sm_${ts36}_${rand6}
user_id (TEXT)
role (TEXT: 'user'|'staff')
content (TEXT)
created_at (INTEGER ms)

// error_feedbacks
id (TEXT PK)                 // fb_${ts36}_${rand6}
user_id (TEXT, NULL)
content (TEXT)
created_at (INTEGER ms)
```

Indexes: `exam_results(user_id)`, `exam_results(created_at)`, `support_messages(user_id, created_at)`, `error_feedbacks(created_at)`, `users(department_id)`

## API Endpoints

### Bootstrap & User
| Method | Path | Input | Returns |
|---|---|---|---|
| POST | `/api/bootstrap` | `{ userId }` | `UserBootstrapState` |
| POST | `/api/user/profile` | `{ userId, nickname }` | `{ ok: true }` |

### Exam
| Method | Path | Input | Returns |
|---|---|---|---|
| POST | `/api/exam/submit` | `{ userId, assignedDepartmentId, storyId: 1\|2\|3, amonTriggered: false, overwrite? }` | `ExamSubmitResponse` (may include `transferCard`) |
| GET | `/api/exam/result` | query: `userId, resultId, simulateDelay?` | `ExamResultResponse` |

### Department
| Method | Path | Input | Returns |
|---|---|---|---|
| GET | `/api/departments` | – | `{ departments: DepartmentDetail[] }` |
| GET | `/api/department/my` | query: `userId` | `MyDepartmentResponse` (status: `no_exam`\|`pending_assignment`\|`assigned`) |
| POST | `/api/department/join` | `{ userId, targetDepartmentId }` | `{ ok: true }` |

### Support (User-Facing)
| Method | Path | Input | Returns |
|---|---|---|---|
| POST | `/api/support/send` | `{ userId, content }` | `{ message: SupportMessageDTO }` |
| GET | `/api/support/messages` | query: `userId, sinceId?` | `{ messages[], latestId, unread }` |
| POST | `/api/support/read` | `{ userId, upToId }` | `{ ok: true }` |

### Staff (Admin Console)
| Method | Path | Input | Returns |
|---|---|---|---|
| GET | `/api/staff/conversations` | – | `{ conversations: StaffConversationDTO[] }` |
| GET | `/api/staff/conversations/:userId/messages` | query: `sinceId?` | `{ messages[], latestId, unread }` |
| POST | `/api/staff/reply` | `{ userId, content }` | `{ message: SupportMessageDTO }` |

### Feedback
| Method | Path | Input | Returns |
|---|---|---|---|
| POST | `/api/feedback` | `{ content, userId? }` | `{ ok: true }` |
| GET | `/api/staff/feedback` | – | `{ feedbacks: FeedbackItem[] }` |

### Health
| Method | Path | Input | Returns |
|---|---|---|---|
| GET | `/api/health` | – | `{ ok: true, service, time }` |

## Key Business Rules

- **transferCard**: When a user with an existing department submits an exam result for a *different* department, the `transferCard` field appears in the response. The user's department is NOT auto-switched — the frontend must guide the user to call `/api/department/join` to confirm the switch. First-time submissions directly assign the department.

- **joinedAmon**: `joinedAmon = !!user.joinedAmon || input.amonTriggered`. Never reverts.

- **homepageMessageType**: `name` (new user, no nickname) → `urge_exam` (has nickname, no exam) → `welcome_back` (has nickname + exam) → `none` (edge case).

- **result authorization**: `/api/exam/result` requires `result.userId === query.userId`, returns 403 on mismatch.

- **join department**: Requires `latestResultId` (user must have taken the exam). Overwrites any existing department without confirmation.

- **bootstrap**: `POST /api/bootstrap` creates new user if `userId` doesn't exist. Idempotent GET-like behavior via POST.

## Error Response Format

```json
{ "error": "<machine_code>", "message": "<optional>" }
```

| code | HTTP | Scenario |
|---|---|---|
| `invalid_request` | 400 | zod validation failure |
| `user_not_found` | 404 | userId doesn't exist |
| `result_not_found` | 404 | resultId doesn't exist |
| `result_forbidden` | 403 | resultId doesn't belong to userId |
| `department_not_found` | 404 | department ID doesn't exist |
| `department_missing` | 500 | result links to a deleted department (data integrity) |
| `exam_required` | 409 | joining department without taking exam |
| `internal_error` | 500 | unhandled exception |
| `not_found` | 404 | unmatched route |

`onError` only returns `internal_error` — never leaks DB errors, SQL strings, or filesystem paths.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8080` | HTTP port |
| `CORS_ORIGINS` | `http://localhost:3000` | Comma-separated allowed origins |
| `DB_PATH` | `./data/db.sqlite` | SQLite file path |
| `NODE_ENV` | `development` | – |

## What the Backend Does NOT Do

- Does NOT store questions, scoring weights, or department theme/officer data — all are static data on the frontend.
- Does NOT generate QR codes — removed from backend. The frontend handles share cards.
- Does NOT authenticate staff — the frontend `__staff/support` page uses a hardcoded password (`xinyu1110`) checked client-side.

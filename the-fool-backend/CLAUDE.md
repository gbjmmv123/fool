# 愚者教会后端

娱乐项目，为前端提供身份 / 笔试 / 部门 / 结果二维码接口。单机 SQLite，无鉴权，无监控。

## 技术栈

| 类别 | 选择 | 备注 |
|---|---|---|
| 运行时 | Node.js ≥ 20 | |
| HTTP | Hono + `@hono/node-server` | |
| ORM/DB | better-sqlite3 + Drizzle | 同步 API |
| 校验 | zod | |
| Canvas | `@napi-rs/canvas` | prebuilt，无需本地 cairo |
| QR | `qrcode` | 直出 PNG buffer |
| 开发态 | `tsx watch` | |
| 生产构建 | `tsup`（ESM target node20） | `--external better-sqlite3 --external @napi-rs/canvas` |
| 环境变量 | `dotenv` | |

命令：`npm run dev` / `npm run build` / `npm run start` / `npm run typecheck` / `npm run db:reset`

---

## 架构规则

1. **路由层只做 IO**：zod 校验 → 调 domain → 翻译响应，不写业务逻辑。
2. **业务逻辑全在 `domain/`**：纯函数 + 同步 DB 调用，不依赖 Hono context。
3. **DB schema 是真相源**：`db/schema.ts` 是表定义，`types/api.ts` 是对外契约，两者不互相 import。
4. **时间双轨制**：DB 存 ms（`integer`），对外吐 ISO 字符串（`new Date(ms).toISOString()`）。
5. **错误三类**：4xx 业务错误（domain 返回 `{ok:false}`）/ 4xx 校验错误（zod）/ 5xx 真异常（throw → onError）。禁止 4xx 走 throw。
6. **CORS**：明确放通 `http://localhost:3000`，多域名走 `CORS_ORIGINS` 逗号分隔，不用 `*`。
7. **Drizzle 用同步 API**：`.get()` / `.all()` / `.run()`。

---

## 目录结构

```
src/
  index.ts / app.ts
  routes/         # bootstrap, user, exam, department, qr, static
  domain/         # bootstrap, examSubmit, examResult, department
  canvas/qrCard.ts
  db/             # client, schema, bootstrap(ensureSchema+ensureSeed), reset
  schemas/        # zod schemas
  types/api.ts    # 对外契约（手抄，不 import schema.ts）
  utils/          # ids, time, lru
data/
  seed/departments.json
  db.sqlite       # gitignore
public/avatars/   # 8 张部门长官占位 PNG
```

---

## 数据库 Schema

```ts
// users
id (PK, text)             // 'uid_${ts}_${rand}'，前端生成
nickname (text, NULL)
joinedAmon (integer 0/1)  // 只能 false→true，永不回退
departmentId (text, NULL)
latestResultId (text, NULL)
createdAt / updatedAt (integer ms)

// departments（8 条，启动 ensureSeed）
id (PK)  // 'justice'|'hermit'|'magician'|'highpriestess'|'empress'|'emperor'|'lovers'|'leodero'
name / description / officerName / officerTitle / officerAvatar / officerIntro
themeColor (text)
sortOrder (integer)

// exam_results
id (PK)                   // 'result_${ts}_${rand}'，后端生成
userId
scores (text JSON)        // Record<string, number>，前端计算
assignedDepartmentId
previousDepartmentId (NULL)
storyType                 // 'escape_failed'|'hao_ya_hao_ya'|'leodero'|'none'，前端计算
amonTriggered (0/1)       // 前端计算
joinedAt (text ISO)
createdAt (integer ms)
```

索引：`exam_results.userId` / `exam_results.createdAt` / `users.departmentId`

无 questions 表，无 answers / questionVersion / summary / comment 字段。

---

## API 契约

| Method | Path | 入参 | 返回 |
|---|---|---|---|
| GET | `/api/health` | – | `{ ok: true }` |
| POST | `/api/bootstrap` | `{ userId }` | `UserBootstrapState` |
| POST | `/api/user/profile` | `{ userId, nickname }` | `{ ok: true }` |
| POST | `/api/exam/submit` | `{ userId, assignedDepartmentId, scores, storyType, amonTriggered, overwrite? }` | `ExamSubmitResponse` |
| GET | `/api/exam/result` | query: `userId, resultId` | `ExamResultResponse` |
| GET | `/api/department/my` | query: `userId` | `MyDepartmentResponse` |
| GET | `/api/departments` | – | `{ departments: DepartmentDetail[] }` |
| POST | `/api/department/join` | `{ userId, targetDepartmentId, replaceCurrent }` | `{ ok: true }` |
| GET | `/api/qr/result` | query: `userId, resultId` | `image/png` |
| GET | `/static/avatars/*` | – | `image/png` |

无 `/api/exam/questions` 接口——题目在前端，后端不存不返。

---

## 关键业务规则

**前端计算，后端只存**：评分、部门归属、amonTriggered、storyType 全在前端完成。submit 只做：校验 `assignedDepartmentId` 存在、判断 transferCard、事务写库。

**joinedAmon 不可回退**：`joinedAmon: !!user.joinedAmon || input.amonTriggered`

**homepageMessageType**：
```
isNewUser                      → 'name'
nickname && !hasCompletedExam  → 'urge_exam'
nickname && hasCompletedExam   → 'welcome_back'
否则                            → 'none'
```

**transferCard**：仅当 `previousDepartmentId !== null && previousDepartmentId !== assignedDepartmentId` 时返回。首次分配直接写 `users.departmentId`；有旧部门时不在 submit 阶段更新，让前端走 `/api/department/join` 确认。

**result 越权防护**：`/api/exam/result` 必须校验 `result.userId === query.userId`，不匹配返 403。

**qrCodeUrl**：`${PUBLIC_BASE_URL}/api/qr/result?userId=&resultId=`（后端地址，前端 `<img src>` 拉 PNG）。Canvas QR payload：`${PUBLIC_BASE_URL_FRONTEND}/exam/result?resultId=...`（扫码跳前端页面）。

---

## 错误响应格式

```json
{ "error": "<machine_code>", "message": "<optional>" }
```

| code | HTTP | 触发场景 |
|---|---|---|
| `invalid_request` | 400 | zod 校验失败 |
| `user_not_found` | 404 | userId 不存在 |
| `result_not_found` | 404 | resultId 不存在 |
| `result_forbidden` | 403 | resultId 与 userId 不匹配 |
| `department_not_found` | 404 | submit/join 时 dept 不存在 |
| `department_missing` | 500 | result 关联的部门数据丢失 |
| `exam_required` | 409 | 未笔试就 join |
| `already_in_other_department` | 409 | 已有部门 + replaceCurrent=false |
| `internal_error` | 500 | 未处理异常 |
| `not_found` | 404 | 未匹配的路由 |

`onError` 只返 `internal_error`，不 leak DB error / SQL string / file path。

---

## Canvas

唯一用途：`/api/qr/result` 出 300×360 PNG。布局：顶部主题色条（8px）→ 部门名（18px bold）→ 200×200 QR（`#0a0a14` on `#f5e9c3`）→ 昵称（14px）+ 水印 + resultId。

中文字体：注册 `public/fonts/NotoSansSC-Regular.otf`（`GlobalFonts.registerFromPath`）。

LRU 缓存：`Map<userId:resultId, Buffer>`，max 64。`DISABLE_QR_CACHE=1` 关掉。

响应头：`Content-Type: image/png` + `Cache-Control: public, max-age=86400`

---

## 环境变量

| 变量 | 默认 | 说明 |
|---|---|---|
| `PORT` | `8080` | HTTP 端口 |
| `PUBLIC_BASE_URL` | `http://localhost:8080` | 后端自身地址，用于 qrCodeUrl |
| `PUBLIC_BASE_URL_FRONTEND` | `http://localhost:3000` | QR payload 中前端页面 URL 前缀 |
| `CORS_ORIGINS` | `http://localhost:3000` | 多个用逗号分隔 |
| `DB_PATH` | `./data/db.sqlite` | SQLite 文件 |
| `DISABLE_QR_CACHE` | `0` | 设 `1` 关掉 QR 内存缓存 |
| `NODE_ENV` | `development` | |

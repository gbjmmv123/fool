# 接口文档

Base URL: `http://localhost:8080`

所有错误响应格式：`{ "error": "<code>", "message": "<可选>" }`

---

## GET /api/health

健康检查。

**响应**
```json
{ "ok": true, "service": "the-fool-backend", "time": "2026-05-12T10:00:00.000Z" }
```

---

## POST /api/bootstrap

用户首次访问或回访，不存在则自动创建。

**请求**
```json
{ "userId": "uid_xxx" }
```

`userId` 格式：`uid_` 前缀 + 字母数字下划线，长度 8~64。

**响应 200**
```json
{
  "userId": "uid_xxx",
  "nickname": null,
  "isNewUser": true,
  "hasCompletedExam": false,
  "hasDepartment": false,
  "departmentId": null,
  "departmentName": null,
  "joinedAmonFamily": false,
  "latestExamResultId": null,
  "homepageMessageType": "name"
}
```

`homepageMessageType` 取值：

| 值 | 条件 |
|---|---|
| `name` | 新用户，需要填昵称 |
| `urge_exam` | 有昵称但未完成笔试 |
| `welcome_back` | 有昵称且已完成笔试 |
| `none` | 其他（无昵称且非新用户） |

---

## POST /api/user/profile

设置昵称。昵称 1~16 字符，自动 trim。

**请求**
```json
{ "userId": "uid_xxx", "nickname": "测试者" }
```

**响应 200** `{ "ok": true }`

**错误**：`user_not_found` 404

---

## POST /api/exam/submit

提交笔试结果（前端已完成所有计算）。每次调用都会写入一条新 `exam_results` 记录并更新 `users.latest_result_id`。

**请求**
```json
{
  "userId": "uid_xxx",
  "assignedDepartmentId": "hermit",
  "storyId": 1,
  "amonTriggered": false,
  "overwrite": true
}
```

- `storyId`：`1`=好呀好呀 / `2`=列奥德罗 / `3`=纸人替身（前端计算）
- `overwrite`：可选，传 `true` 表示重新答题覆盖（后端目前不做额外限制，字段接收但不影响写入逻辑）

**响应 200**
```json
{
  "resultId": "result_xxx",
  "storyId": 1,
  "amonTriggered": false
}
```

当用户已有部门且本次分配部门不同时，响应额外包含 `transferCard`：
```json
{
  "resultId": "result_xxx",
  "storyId": 1,
  "amonTriggered": false,
  "transferCard": {
    "show": true,
    "from": { "id": "justice", "name": "正义女士部门" },
    "to": { "id": "hermit", "name": "隐者部门" }
  }
}
```

> `transferCard` 出现时，`users.department_id` **不会**自动切换——需要前端引导用户调用 `/api/department/join` 显式确认。首次提交（无原部门）则直接写入新部门。

**错误**：`user_not_found` 404 / `department_not_found` 404

---

## GET /api/exam/result

获取笔试结果详情。

**Query 参数**：`userId`、`resultId`、`simulateDelay`（可选）

**响应 200**
```json
{
  "loadingState": "done",
  "storyId": 1,
  "amonTriggered": false,
  "assignedDepartmentId": "hermit",
  "assignedDepartmentName": "隐者部门",
  "detail": {
    "nickname": "测试者",
    "joinedAt": "2026-05-12T10:00:00.000Z"
  }
}
```

当建议切换部门时，额外包含 `transferCard`（条件：`previousDepartmentId` 非空 + 与 `assignedDepartmentId` 不同 + 用户当前部门仍是原部门）：
```json
{
  "transferCard": {
    "show": true,
    "targetDepartmentId": "hermit",
    "targetDepartmentName": "隐者部门"
  }
}
```

`?simulateDelay=1` 可让 `loadingState` 返回 `preparing`（前端 loading 动画联调用）。

**错误**：`result_not_found` 404 / `result_forbidden` 403 / `user_not_found` 404

---

## GET /api/department/my

获取当前用户的部门状态（三态）。

**Query 参数**：`userId`

**响应 200 — 未笔试**
```json
{ "status": "no_exam" }
```

**响应 200 — 已笔试未分配（兜底态，正常流程不应出现）**
```json
{ "status": "pending_assignment" }
```

**响应 200 — 已分配**
```json
{
  "status": "assigned",
  "department": {
    "id": "hermit",
    "name": "隐者部门",
    "description": "孤独的真理追寻者，掌管教会的资料与古卷。",
    "officer": {
      "name": "老 K",
      "title": "隐者",
      "avatar": "/static/avatars/hermit.png",
      "intro": "他一个人胜过一座图书馆。"
    },
    "members": [
      { "userId": "uid_xxx", "nickname": "测试者", "joinedAt": "2026-05-12T10:00:00.000Z" }
    ],
    "memberCount": 42
  },
  "examSummary": {
    "resultId": "result_xxx",
    "joinedAt": "2026-05-12T10:00:00.000Z"
  }
}
```

- `members`：最多返回 12 条，按加入时间倒序
- `officer.avatar`：完整路径字符串，如 `/static/avatars/hermit.png`

---

## GET /api/departments

获取全部 8 个部门，按 `sort_order` 升序。

**响应 200**
```json
{
  "departments": [
    {
      "id": "justice",
      "name": "正义女士部门",
      "description": "执掌天平与裁决，处理教会内部纠纷与外部冲突。",
      "officer": {
        "name": "薇娜",
        "title": "正义女士",
        "avatar": "/static/avatars/justice.png",
        "intro": "她从不闭眼，从不偏袒。"
      },
      "members": [...],
      "memberCount": 10
    }
  ]
}
```

---

## POST /api/department/join

加入部门（直接覆盖原部门）。

**请求**
```json
{
  "userId": "uid_xxx",
  "targetDepartmentId": "hermit"
}
```

**响应 200** `{ "ok": true }`

**说明**：
- 已有其他部门时直接覆盖，无需额外确认
- `joinedAmon` 不受此接口影响（阿蒙状态只由 `/exam/submit` 写入）
- 必须先参加笔试才能加入（`latestResultId` 不为空）

**错误**：`user_not_found` 404 / `department_not_found` 404 / `exam_required` 409

---

## 错误码一览

| code | HTTP | 触发场景 |
|---|---|---|
| `invalid_request` | 400 | 入参格式错误（zod 校验失败） |
| `user_not_found` | 404 | userId 不存在 |
| `result_not_found` | 404 | resultId 不存在 |
| `result_forbidden` | 403 | resultId 不属于该 userId |
| `department_not_found` | 404 | 部门 ID 不存在 |
| `department_missing` | 500 | result 关联的部门数据丢失（数据异常） |
| `exam_required` | 409 | 未参加笔试就 join |
| `internal_error` | 500 | 未处理异常 |
| `not_found` | 404 | 路由不存在 |

---

## 不提供的接口

以下功能完全由前端实现，后端无对应接口：

- 题目获取（题目存在前端本地）
- 评分计算、部门归属、storyType 派生（前端计算后提交结果）
- 分享卡片生成（前端 Canvas 绘制）
- 部门长官头像（前端静态资源）

# 愚者教会前端

娱乐项目。用户首次进入 → 生成身份 → 参加笔试 → 获得部门归属 → 持续回访。页面展示由后端 bootstrap 接口驱动。

## 技术栈

| 类别 | 技术 |
|---|---|
| 框架 | Nuxt 3（`srcDir: 'app/'`） |
| 语言 | TypeScript（strict） |
| UI | Vue 3 |
| 组合式工具 | VueUse (`@vueuse/core`) |
| 样式 | UnoCSS（presetWind3 + presetAttributify + presetIcons） |
| 状态管理 | `useState` + composables（不引入 Pinia） |
| HTTP | `$fetch` 封装于 `services/` |
| 动画 | Vue `Transition` + CSS keyframes |

命令：`npm run dev` / `npm run build` / `npm run preview`

---

## 架构规则

1. **页面只做组合**，复杂逻辑放 composables。
2. **所有页面在 `default.vue` 壳层下运行**，不自行写最外层布局。
3. **页面内容统一用 `MainContent.vue` 包裹**。
4. **颜色不写死在组件里**，使用 CSS 变量（`--dt-*`）。
5. **弹窗统一走 `useDialog` + `ModalContainer`**。
6. **用户状态以后端 bootstrap 结果为准**，前端不自行推断。
7. **`useState` 全局唯一 key 必须带 `church-` 前缀**，避免 SSR hydration 串台。
8. **localStorage 仅在 `import.meta.client` 内访问**。
9. **服务端请求走 `services/`**，组件不直接 `$fetch`。
10. **CSS 变量优先用 `--dt-*`**，`--c-*` 是兼容别名，不主动新增。

---

## 目录结构

```
app/
  layouts/
    default.vue     # 全局壳：TopNav + NuxtPage + ModalContainer
    none.vue
  pages/
  components/
    main/           # MainContent.vue, MainTitle.vue
    nav/            # TopNav, TopNavItem, MobileNavDrawer
    modal/          # ModalDialog（壳）, ModalContainer, 业务弹窗
    home/
    about/
    exam/
    result/
    department/
    shared/
  composables/
  services/         # api.ts + 各域封装（user/exam/department）
  types/            # TypeScript 类型定义（含 page-meta.d.ts 扩展）
  utils/            # 纯函数（storage/scroll/time）
  middleware/       # access.global.ts
  styles/
    vars.css        # CSS 变量（--dt-* 主，--c-* 兼容别名）
    global.css
```

---

## 路由表

| 路由 | 页面 | 关键 meta |
|---|---|---|
| `/` | 首页 | bootstrap 入口 |
| `/about` | 了解愚者教会 | 逐行 reveal 动画 |
| `/exam` | 入会笔试 | 答题 + 草稿 |
| `/exam/result` | 笔试结果 | `requiresExamResult: true` |
| `/department/my` | 我的部门 | |
| `/departments` | 全部部门 | `wideLayout: true` |
| `/amon` | 阿蒙家族 | `requiresAmon: true` |

page-meta 字段（`app/types/page-meta.d.ts`）：`title` / `showTopNav` / `wideLayout` / `requiresExamResult` / `requiresAmon`

---

## 全局状态模型

```ts
// types/user.ts
export interface UserBootstrapState {
  userId: string
  nickname: string | null
  isNewUser: boolean
  hasCompletedExam: boolean
  hasDepartment: boolean
  departmentId: string | null
  departmentName: string | null
  joinedAmonFamily: boolean
  latestExamResultId: string | null
  homepageMessageType: 'name' | 'urge_exam' | 'welcome_back' | 'none'
}
```

---

## 本地存储键名

| 键 | 用途 |
|---|---|
| `church_user_id` | 用户唯一标识，格式 `uid_${Date.now()}_${random6}`，只生成一次 |
| `church_exam_draft` | 笔试草稿：`{ version, answers, updatedAt }` |
| `church_exam_draft_updated_at` | 草稿更新时间 |
| `church_last_welcome_key` | 欢迎弹窗去重，格式 `${userId}:${homepageMessageType}:${YYYY-MM-DD}` |
| `church_reduced_motion_opt_in` | 动效降级偏好（`'1'` 表示用户主动开启） |
| `church_support_draft` | 客服输入框草稿，跨刷新保留 |
| `church_support_last_seen_id` | 客服最后已读消息 ID，跨刷新保留 |

---

## Composables 职责速查

| composable | 核心职责 |
|---|---|
| `useUserIdentity` | 读取或生成 userId，写入 localStorage |
| `useBootstrap` | 请求 bootstrap，暴露 `state/loading/error/initialized/refresh/patchState` |
| `useDialog` | 全局弹窗 API，Promise 风格 |
| `useReducedMotion` | 合并系统 `prefers-reduced-motion` 与本地 opt-in |
| `useHomeView` | 根据 bootstrap 状态计算首页模块 + 欢迎弹窗意图 |
| `useExamDraft` | 草稿防抖保存 / 恢复 / 清空 + 版本对账 |
| `useExamFlow` | 题目加载、作答、校验、提交、跳转 |
| `useExamResultStory` | 结果页 Loading→Story→Detail 时序控制 |
| `useDepartmentView` | 我的部门 + 全部部门数据获取 |
| `useAmonMode` | 阿蒙视觉与功能开关（纯派生自 bootstrap + route） |

```ts
export interface AmonModeState {
  enabled: boolean
  showAmonNav: boolean
  showAmonWatermark: boolean
  showAmonTailContent: boolean
  amonThemeClass: string | null
}
```

---

## 弹窗系统

三层结构：`ModalDialog`（壳）→ `ModalContainer`（挂载）→ `useDialog`（API）

```ts
openNameInputDialog(): Promise<{ nickname: string } | null>  // 阻塞型，不可 Esc/遮罩关闭
openWelcomeDialog(message: string): Promise<void>
openAlertDialog(options: { title?: string; message: string }): Promise<void>
openConfirmDialog(options: { title: string; message: string }): Promise<'confirm' | 'cancel'>
closeDialog(key: string): void
```

body 滚动锁定使用引用计数（多个弹窗叠加时只锁一次）。

---

## API 接口契约

后端默认地址 `http://localhost:8080`，统一通过 `services/api.ts` 的 `apiRequest` 调用。

### `POST /api/bootstrap`
```json
{ "userId": "uid_1710000000000_a1b2c3" }
// 返回 → UserBootstrapState
```

### `POST /api/user/profile`
```json
{ "userId": "...", "nickname": "奥黛丽" }
```

### `POST /api/exam/submit`
```json
// 请求
{ "userId": "...", "assignedDepartmentId": "justice", "scores": { "q1": 2 },
  "storyType": "hao_ya_hao_ya", "amonTriggered": false, "overwrite": true }
// 返回
{ "resultId": "result_...", "firstCompletion": true,
  "transferCard": { "show": true, "previousDepartmentId": "hermit", "previousDepartmentName": "..." } }
```

### `GET /api/exam/result?userId=&resultId=`
```json
{ "loadingState": "done", "storyType": "hao_ya_hao_ya",
  "detail": { "nickname": "...", "departmentId": "...", "departmentName": "...",
               "officerAvatar": "...", "joinedAt": "...", "qrCodeUrl": "..." },
  "transferCard": { "show": true, "targetDepartmentId": "justice", "targetDepartmentName": "..." } }
```

`storyType`：`'escape_failed' | 'hao_ya_hao_ya' | 'leodero' | 'none'`
`loadingState`：`'preparing' | 'done'`（前端最多重试 1 次）

### `GET /api/department/my?userId=`
```json
{ "status": "assigned",
  "department": { "id": "...", "name": "...", "officer": { ... }, "memberCount": 42 },
  "examSummary": { "resultId": "...", "joinedAt": "..." } }
```
`status`：`'no_exam' | 'pending_assignment' | 'assigned'`

### `GET /api/departments` → `{ departments: [DepartmentDetail, ...] }`

### `POST /api/department/join`
```json
{ "userId": "...", "targetDepartmentId": "justice", "replaceCurrent": true }
```

### `GET /api/qr/result?userId=&resultId=` → `image/png`

---

## CSS 变量

定义在 `styles/vars.css`，主命名空间 `--dt-*`：

```css
--dt-bg-base / --dt-bg-card
--dt-text-base / --dt-text-secondary / --dt-text-title / --dt-text-heading
--dt-primary
--dt-border-default / --dt-border-active / --dt-border-highlight
--dt-danger
--dt-radius-card / --dt-shadow-card
--dt-amon-watermark-opacity   /* 建议 0.06~0.14 */
```

阿蒙模式通过 `.theme-amon` 类覆盖部分变量，作用范围限 `MainContent`，不挂 `body`。

---

## 动效降级

`useReducedMotion()` 为 true 时（系统 `prefers-reduced-motion: reduce` 或本地 opt-in）：
- 教会介绍页直接展示完整文本，跳过逐行 reveal
- 结果页剧情阶段整体跳过，直接进入 detail
- 阿蒙水印不浮动
- 笔试未答题高亮改静态红边

---

## 路由守卫（`middleware/access.global.ts`）

```ts
if (to.meta.requiresExamResult) {
  if (!isString(to.query.resultId) || !to.query.resultId) return navigateTo('/')
}
if (to.meta.requiresAmon && import.meta.client) {
  const { initialized, state } = useBootstrap()
  if (initialized.value && !state.value.joinedAmonFamily) return navigateTo('/')
}
```

`requiresAmon` 仅在 `import.meta.client` 校验，SSR 阶段不强制（bootstrap state 默认值会误判）。

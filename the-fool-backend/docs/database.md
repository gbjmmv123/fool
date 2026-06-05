# 数据库文档

SQLite，3 张表，启动自动建表 + 注入种子。

---

## users（用户）

| 字段 | 类型 | 说明 |
|---|---|---|
| id | TEXT PK | 前端生成，格式 `uid_${ts}_${rand}` |
| nickname | TEXT NULL | 用户昵称，可为空 |
| joined_amon | INTEGER 0/1 | 是否加入阿蒙家族，只能 false→true，不可回退 |
| department_id | TEXT NULL | 当前所属部门 ID，NULL = 未分配 |
| latest_result_id | TEXT NULL | 最新笔试结果 ID，NULL = 未参加笔试 |
| created_at | INTEGER | 创建时间（ms） |
| updated_at | INTEGER | 更新时间（ms） |

---

## departments（部门，静态种子）

| 字段 | 类型 | 说明 |
|---|---|---|
| id | TEXT PK | 固定值之一（见下） |
| name | TEXT | 部门名称 |
| description | TEXT | 部门描述 |
| officer_name | TEXT | 长官姓名 |
| officer_title | TEXT | 长官职称 |
| officer_avatar | TEXT | 头像路径，如 `/static/avatars/hermit.png` |
| officer_intro | TEXT | 长官简介 |
| theme_color | TEXT | 主题色（HEX） |
| sort_order | INTEGER | 排序，`leodero` 为 99（排最后） |

**8 个部门 ID**：`justice` / `hermit` / `magician` / `highpriestess` / `empress` / `emperor` / `lovers` / `leodero`

**种子数据**（`data/seed/departments.json`，启动时若表为空自动注入）：

| id | name | officer | themeColor |
|---|---|---|---|
| justice | 正义女士部门 | 薇娜（正义女士） | #d4b35c |
| hermit | 隐者部门 | 老 K（隐者） | #7a8a99 |
| magician | 魔术师部门 | 小周（魔术师） | #c47b54 |
| highpriestess | 女祭司部门 | 苏（女祭司） | #6b7ec4 |
| empress | 皇后部门 | 梅梅（皇后） | #c2858f |
| emperor | 皇帝部门 | 卡尔（皇帝） | #a85a3e |
| lovers | 恋人部门 | 伊澄（恋人） | #d57aa4 |
| leodero | Leodero 部门 | Leodero（执钥者） | #8c6dd2 |

---

## exam_results（笔试结果）

| 字段 | 类型 | 说明 |
|---|---|---|
| id | TEXT PK | 后端生成，格式 `result_${ts36}_${rand6}` |
| user_id | TEXT | 关联 users.id |
| assigned_department_id | TEXT | 前端计算的归属部门 |
| previous_department_id | TEXT NULL | 提交时用户的原部门，NULL = 首次提交 |
| story_id | INTEGER | 故事走向，前端计算（枚举见下） |
| amon_triggered | INTEGER 0/1 | 是否触发阿蒙，前端计算 |
| joined_at | TEXT | 加入时间（ISO 字符串） |
| created_at | INTEGER | 创建时间（ms） |

**story_id 枚举**：
- `1` = 好呀好呀（普通结局）
- `2` = 列奥德罗（阿蒙路线）
- `3` = 纸人替身（逃避路线）

**索引**：`exam_results(user_id)` / `exam_results(created_at)` / `users(department_id)`

---

## 说明

- 题目、评分权重、scores、storyType 派生、分享卡片——全在前端，后端不存储
- 时间存储：DB 内用 ms 整数，对外 API 返回 ISO 字符串
- 启动时自动建表，`departments` 表为空时自动注入 8 条种子
- `joined_amon` 只增不减：`submitExam` 中用 `!!user.joinedAmon || amonTriggered` 写入

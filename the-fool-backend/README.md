# 愚者教会后端

Node.js + Hono + Drizzle (SQLite)。配套前端见 `../the-fool-frontend`。

## 快速开始

```bash
npm install
cp .env.example .env
npm run db:reset      # 第一次或想清空数据时
npm run dev           # 监听 :8080，tsx watch
```

前端 (`../the-fool-frontend`) 跑在 :3000，CORS 已默认放通。

## 架构说明

**前端计算模式**：题目和评分逻辑完全在前端，后端只负责记录和返回关键信息。

- 题目内容、评分权重、storyType 派生、阿蒙触发判定 → 全在前端
- 后端存储：用户基本信息、部门信息（静态种子）、测试结果快照

## 主要接口

| Method | Path | 说明 |
|---|---|---|
| GET  | /api/health | 健康检查 |
| POST | /api/bootstrap | 用户首启 / 回访 |
| POST | /api/user/profile | 设置昵称 |
| POST | /api/exam/submit | 提交前端计算结果，返回 resultId |
| GET  | /api/exam/result | 拿结果详情 |
| GET  | /api/department/my | 我的部门 |
| GET  | /api/departments | 全部部门 |
| POST | /api/department/join | 切换 / 加入部门 |

## 数据库

SQLite 文件 `data/db.sqlite`（gitignore）。3 张表：`users` / `departments` / `exam_results`。

```bash
npm run db:reset
sqlite3 data/db.sqlite ".tables"
```

## 环境变量

| 变量 | 默认 | 说明 |
|---|---|---|
| PORT | 8080 | HTTP 端口 |
| CORS_ORIGINS | http://localhost:3000 | 多个用逗号分隔 |
| DB_PATH | ./data/db.sqlite | SQLite 文件 |
| NODE_ENV | development | – |

## 端到端走查

```bash
npm run db:reset && npm run dev &
chmod +x scripts/e2e-smoke.sh && ./scripts/e2e-smoke.sh
```

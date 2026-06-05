# 愚者教会 (theFool)

A "Tower of Tarot" (诡秘之主 / Lord of Mysteries) themed web project. Users take a personality quiz → get sorted into a department (大阿卡那牌) → join the "Church of the Fool."

## Project Structure

```
theFool/
  the-fool-backend/    # Node.js + Hono + SQLite API (:8080)
  the-fool-frontend/   # Nuxt 3 SPA with UnoCSS (:3000)
```

The frontend does **all scoring/computation**; the backend only stores and returns results.

## Quick Start

```bash
# Backend (port 8080)
cd the-fool-backend && npm install && npm run db:reset && npm run dev

# Frontend (port 3000, separate terminal)
cd the-fool-frontend && npm install && npm run dev
```

## Architecture Rules (Global)

- **Frontend computes, backend stores**: Questions, scoring weights, department assignment, story type — all calculated in the frontend. Backend just records the result.
- **No authentication**: User identity is a random `uid_...` stored in localStorage.
- **SQLite, single-file**: `the-fool-backend/data/db.sqlite` is gitignored. Reset with `npm run db:reset`.
- **CORS**: Backend allows `http://localhost:3000` by default (configurable via `CORS_ORIGINS`).

## When Modifying

- **Backend**: Routes do IO only. Business logic lives in `domain/`. See `the-fool-backend/AGENTS.md`.
- **Frontend**: Pages compose components and composables. No direct `$fetch` in components — use `services/`. See `the-fool-frontend/AGENTS.md`.
- **Shared types**: The backend `types/api.ts` defines the contract. The frontend has its own `types/` directory and must stay in sync manually.

## Useful Commands

```bash
# Reset everything (backend)
cd the-fool-backend && npm run db:reset

# Type-check backend
cd the-fool-backend && npm run typecheck

# Build backend for production
cd the-fool-backend && npm run build && npm run start

# Check SQLite data
sqlite3 the-fool-backend/data/db.sqlite ".tables"
```

#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR/.."

cd "$ROOT"

# Load DB_PATH from .env if present
DB_PATH="./data/db.sqlite"
if [ -f .env ]; then
  val=$(grep -E '^DB_PATH=' .env | cut -d= -f2-)
  [ -n "$val" ] && DB_PATH="$val"
fi

echo "[1/3] Killing existing backend process on port 8080..."
PID=$(lsof -ti :8080 2>/dev/null || true)
if [ -n "$PID" ]; then
  kill "$PID"
  sleep 1
  echo "      Killed PID $PID"
else
  echo "      No process found on port 8080"
fi

echo "[2/3] Removing database files..."
for f in "$DB_PATH" "${DB_PATH}-wal" "${DB_PATH}-shm" "${DB_PATH}-journal"; do
  fp="$(cd "$ROOT" && realpath -m "$f" 2>/dev/null || echo "$ROOT/$f")"
  if [ -f "$fp" ]; then
    rm -f "$fp"
    echo "      Removed $fp"
  fi
done

echo "[3/3] Starting backend (tsx watch)..."
npm run dev

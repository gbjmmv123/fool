#!/usr/bin/env bash
set -e
SERVER_IP="192.144.132.228"
SERVER_PATH="/www/wwwroot/theFool"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"

echo "🚀 安全部署模式 (带自动备份)..."

# ── 0. 备份 ──
echo "[0/5] 备份服务器当前代码..."
ssh root@${SERVER_IP} "cd /www/wwwroot && tar -czf theFool-${BACKUP_NAME}.tar.gz \
  --exclude='node_modules' \
  --exclude='.output' \
  --exclude='.nuxt' \
  --exclude='dist' \
  --exclude='data/db.sqlite*' \
  --exclude='._*' \
  theFool/ && echo '备份完成'"

# ── 1. 同步源码 ──
echo "[1/5] 同步源码..."
rsync -avz \
  --exclude='node_modules' \
  --exclude='.nuxt' \
  --exclude='.output' \
  --exclude='dist' \
  --exclude='data/db.sqlite*' \
  --exclude='._*' \
  --exclude='.DS_Store' \
  --exclude='.git' \
  --exclude='*.tar.gz' \
  "$SCRIPT_DIR"/../ \
  root@${SERVER_IP}:${SERVER_PATH}/

# ── 2. 后端构建 ──
echo "[2/5] 后端构建..."
if ! ssh root@${SERVER_IP} bash << 'BACKEND'
set -e
export PATH=/usr/local/bin:$PATH
cd /www/wwwroot/theFool/the-fool-backend
npm rebuild better-sqlite3 2>/dev/null || true
echo "  [后端] 删除旧依赖并重新安装..."
rm -rf node_modules
npm install
npm run build
BACKEND
then
  echo "❌ 后端构建失败！回滚: ./scripts/rollback.sh ${BACKUP_NAME}"
  exit 1
fi

# ── 3. 前端构建 ──
echo "[3/5] 前端构建..."
if ! ssh root@${SERVER_IP} bash << 'FRONTEND'
set -e
export PATH=/usr/local/bin:$PATH
cd /www/wwwroot/theFool/the-fool-frontend
chattr -i .output/public/.user.ini 2>/dev/null || true
echo "  [前端] 删除旧依赖并重新安装..."
rm -rf node_modules
npm install
echo "  [前端] SSG 生成中，请耐心等待..."
rm -rf .output .nuxt
NUXT_PUBLIC_API_BASE='' npx nuxi generate
FRONTEND
then
  echo "❌ 前端构建失败！回滚: ./scripts/rollback.sh ${BACKUP_NAME}"
  exit 1
fi

# ── 4. Nginx ──
echo "[4/5] 重载 Nginx..."
ssh root@${SERVER_IP} "cp /www/wwwroot/theFool/deploy/nginx.conf /www/server/panel/vhost/nginx/thefool.conf && sed -i \"s|/opt/theFool|/www/wwwroot/theFool|g\" /www/server/panel/vhost/nginx/thefool.conf && sed -i \"s/server_name _;/server_name fool.papercube.ltd;/\" /www/server/panel/vhost/nginx/thefool.conf && nginx -t && nginx -s reload"

# ── 5. 后端重启 ──
echo "[5/5] 重启后端..."
ssh root@${SERVER_IP} "export PATH=/usr/local/bin:\$PATH && pm2 restart thefool-backend"

echo ""
echo "✅ 部署完成！ https://fool.papercube.ltd"
echo "   备份: /www/wwwroot/theFool-${BACKUP_NAME}.tar.gz"

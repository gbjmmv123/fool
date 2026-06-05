#!/usr/bin/env bash
set -e
SERVER_IP="192.144.132.228"
SERVER_PATH="/www/wwwroot/theFool"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 部署到 $SERVER_IP ..."

echo "[1/4] 同步源码..."
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

echo "[2/4] 服务器构建..."
ssh root@${SERVER_IP} bash << 'REMOTE'
set -e
export PATH=/usr/local/bin:$PATH
PROJ=/www/wwwroot/theFool

echo "  [后端] 检查依赖..."
cd $PROJ/the-fool-backend
npm rebuild better-sqlite3 2>/dev/null || true
if [ package.json -nt node_modules ]; then
  echo "  [后端] package.json 已变更，重新安装依赖..."
  npm install
else
  echo "  [后端] 依赖无变化，跳过安装"
fi
echo "  [后端] 构建..."
npm run build

echo "  [前端] 检查依赖..."
cd $PROJ/the-fool-frontend
if [ package.json -nt node_modules ]; then
  echo "  [前端] package.json 已变更，重新安装依赖..."
  npm install
else
  echo "  [前端] 依赖无变化，跳过安装"
fi
echo "  [前端] 构建 (SSG 生成，请耐心等待)..."
rm -rf .output .nuxt
NUXT_PUBLIC_API_BASE='' npx nuxi generate

echo "[3/4] 重载 Nginx..."
cp $PROJ/deploy/nginx.conf /www/server/panel/vhost/nginx/thefool.conf
sed -i "s|/opt/theFool|/www/wwwroot/theFool|g" /www/server/panel/vhost/nginx/thefool.conf
sed -i "s/server_name _;/server_name fool.papercube.ltd;/" /www/server/panel/vhost/nginx/thefool.conf
nginx -t && nginx -s reload

echo "[4/4] 重启后端..."
pm2 restart thefool-backend

echo ""
echo "✅ 部署完成！ https://fool.papercube.ltd"
REMOTE

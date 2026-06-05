#!/usr/bin/env bash
set -e
SERVER_IP="192.144.132.228"

BACKUP_FILE="${1:-}"
if [ -z "$BACKUP_FILE" ]; then
  echo "用法: ./scripts/rollback.sh <备份文件名>"
  echo ""
  echo "可用备份列表:"
  ssh root@${SERVER_IP} "ls -lh /www/wwwroot/theFool-backup-*.tar.gz 2>/dev/null || echo '  无备份文件'"
  exit 1
fi

echo "⚠️  即将回滚到: $BACKUP_FILE"
echo "   这将覆盖服务器上的所有源代码和构建产物。"
read -p "   确认回滚? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "已取消。"
  exit 0
fi

echo "🔄 回滚中..."

# 删除当前代码
ssh root@${SERVER_IP} "rm -rf /www/wwwroot/theFool/the-fool-backend/src /www/wwwroot/theFool/the-fool-frontend/app"

# 解压备份
ssh root@${SERVER_IP} "cd /www/wwwroot && tar -xzf theFool-${BACKUP_FILE}.tar.gz"

# 重建原生模块
ssh root@${SERVER_IP} "export PATH=/usr/local/bin:\$PATH && cd /www/wwwroot/theFool/the-fool-backend && npm rebuild better-sqlite3"

# 重启
ssh root@${SERVER_IP} "nginx -s reload && export PATH=/usr/local/bin:\$PATH && pm2 restart thefool-backend"

echo "✅ 回滚完成！ https://fool.papercube.ltd"

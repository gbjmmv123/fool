#!/usr/bin/env bash
# ============================================================
#  theFool 服务端看门狗 (watchdog)
#  部署到服务器后通过 cron 每分钟运行，自动检测并恢复后端
#
#  服务器端部署:
#    scp scripts/watchdog.sh root@192.144.132.228:/opt/watchdog-thefool.sh
#    ssh root@192.144.132.228 "chmod +x /opt/watchdog-thefool.sh"
#
#  cron 配置 (每1分钟检测):
#    ssh root@192.144.132.228
#    crontab -e
#    * * * * * /opt/watchdog-thefool.sh >> /var/log/watchdog-thefool.log 2>&1
# ============================================================

export PATH=/usr/local/bin:/usr/bin:/bin:$PATH

HEALTH_URL="http://localhost:8080/api/health"
MAX_RETRIES=1
LOG_TAG="[watchdog-thefool]"
BACKEND_DIR="/www/wwwroot/theFool/the-fool-backend"
ECOSYSTEM_CONF="/www/wwwroot/theFool/ecosystem.config.cjs"

log() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') $LOG_TAG $1"
}

# ── 1. 健康检查 ──
HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' --connect-timeout 5 --max-time 10 "$HEALTH_URL" 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
  exit 0
fi

log "⚠️  后端异常 (HTTP $HTTP_CODE)，开始恢复..."

# ── 2. 检查 PM2 状态 ──
PM2_STATUS=$(pm2 jlist 2>/dev/null | python3 -c "import sys,json; apps=json.load(sys.stdin); print([a['pm2_env']['status'] for a in apps if a['name']=='thefool-backend'][0])" 2>/dev/null || echo "unknown")
log "PM2 thefool-backend 状态: $PM2_STATUS"

# ── 3. 尝试 PM2 重启 ──
log "尝试 PM2 restart..."
pm2 restart thefool-backend 2>/dev/null || true
sleep 3

HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' --connect-timeout 5 --max-time 10 "$HEALTH_URL" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
  log "✅ PM2 重启成功，后端恢复正常"
  exit 0
fi

# ── 4. PM2 重启失败，强杀 + 重建 ──
log "❌ PM2 重启无效 (HTTP $HTTP_CODE)，执行强制恢复..."

# 停止 PM2
pm2 stop thefool-backend 2>/dev/null || true

# 杀掉残留 node 进程
pkill -9 -f "node.*dist/index.js" 2>/dev/null || true
sleep 1

# 释放 8080 端口
fuser -k 8080/tcp 2>/dev/null || true
sleep 1

# 删除 PM2 dump 防止僵尸进程
rm -f ~/.pm2/dump.pm2 2>/dev/null || true

# 重新构建
log "重新构建后端..."
cd "$BACKEND_DIR"
npm run build 2>&1 | tail -3

# 重新启动
log "重新启动 PM2..."
pm2 start "$ECOSYSTEM_CONF" 2>/dev/null || true
pm2 save 2>/dev/null || true
sleep 3

# ── 5. 最终验证 ──
HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' --connect-timeout 5 --max-time 10 "$HEALTH_URL" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
  log "✅ 强制恢复成功，后端正常运行"
else
  log "🚨 所有恢复手段失败！请人工介入！HTTP $HTTP_CODE"
fi

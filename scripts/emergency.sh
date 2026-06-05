#!/usr/bin/env bash
set -euo pipefail

# ============================================================
#  theFool 紧急恢复脚本
#  用法: ./scripts/emergency.sh [check|restart|force|logs|full]
#  从本地一键 SSH 到服务器排查/恢复后端
# ============================================================

SERVER_IP="192.144.132.228"
API_URL="https://fool.papercube.ltd/api/health"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

CMD="${1:-check}"

echo "🆘 theFool 紧急恢复工具"
echo ""

# ── check: 健康检查 ──
do_check() {
  echo "[健康检查] 探测 $API_URL ..."
  if HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' --connect-timeout 5 --max-time 10 "$API_URL" 2>/dev/null); then
    if [ "$HTTP_CODE" = "200" ]; then
      echo -e "${GREEN}✅ 后端正常 (HTTP $HTTP_CODE)${NC}"
      echo "   Response: $(curl -s --max-time 5 "$API_URL")"
      return 0
    else
      echo -e "${RED}❌ 后端异常 (HTTP $HTTP_CODE)${NC}"
      return 1
    fi
  else
    echo -e "${RED}❌ 无法连接到后端${NC}"
    return 1
  fi
}

# ── restart: PM2 重启 ──
do_restart() {
  echo "[PM2 重启] 重启 thefool-backend..."
  ssh root@${SERVER_IP} "export PATH=/usr/local/bin:\$PATH && pm2 restart thefool-backend"
  sleep 3
  do_check
}

# ── force: 强制杀进程 + 重启 ──
do_force() {
  echo "[强制恢复] 杀掉所有后端进程并重启..."
  ssh root@${SERVER_IP} bash << 'REMOTE'
export PATH=/usr/local/bin:$PATH

echo "  1. 停止 PM2 进程..."
pm2 stop thefool-backend 2>/dev/null || true

echo "  2. 杀掉残留的 node 进程..."
pkill -f "node.*dist/index.js" 2>/dev/null || true
sleep 1

echo "  3. 检查端口占用..."
if lsof -i :8080 2>/dev/null | grep -q LISTEN; then
  echo "     端口 8080 仍被占用，强制释放..."
  fuser -k 8080/tcp 2>/dev/null || true
  sleep 1
fi

echo "  4. 删除 PM2 dump 防止僵尸恢复..."
rm -f ~/.pm2/dump.pm2 2>/dev/null || true

echo "  5. 重新构建（确保最新代码）..."
cd /www/wwwroot/theFool/the-fool-backend
npm run build

echo "  6. 重新启动..."
pm2 start /www/wwwroot/theFool/ecosystem.config.cjs
pm2 save
REMOTE
  sleep 3
  do_check
}

# ── logs: 查看最近日志 ──
do_logs() {
  echo "[日志查看] 最近 50 行后端错误日志..."
  ssh root@${SERVER_IP} bash << 'REMOTE'
export PATH=/usr/local/bin:$PATH

echo "=== PM2 进程状态 ==="
pm2 list 2>/dev/null || echo "  PM2 未运行"

echo ""
echo "=== 最近错误日志 ==="
tail -50 /www/wwwroot/theFool/logs/backend-error.log 2>/dev/null || \
  pm2 logs thefool-backend --lines 30 --nostream 2>/dev/null || \
  echo "  无日志文件"

echo ""
echo "=== 系统资源 ==="
echo "  内存: $(free -h 2>/dev/null | awk '/^Mem:/{print $3 "/" $2}' || echo 'N/A')"
echo "  磁盘: $(df -h / 2>/dev/null | awk 'NR==2{print $5 " used (" $3 "/" $2 ")"}' || echo 'N/A')"
echo "  负载: $(uptime 2>/dev/null | awk -F'load average:' '{print $2}' || echo 'N/A')"
REMOTE
}

# ── full: 完整恢复（重建 + 重启 + 验证）──
do_full() {
  echo -e "${YELLOW}[完整恢复] 重新构建 + 部署 + 验证...${NC}"

  ssh root@${SERVER_IP} bash << 'REMOTE'
set -e
export PATH=/usr/local/bin:$PATH

echo "  1/4 重新构建后端..."
cd /www/wwwroot/theFool/the-fool-backend
npm run build

echo "  2/4 停止旧进程..."
pm2 stop thefool-backend 2>/dev/null || true
pkill -f "node.*dist/index.js" 2>/dev/null || true
sleep 1

echo "  3/4 启动新进程..."
pm2 start /www/wwwroot/theFool/ecosystem.config.cjs
pm2 save

echo "  4/4 验证健康..."
sleep 2
curl -s -o /dev/null -w '  HTTP %{http_code}\n' --max-time 5 http://localhost:8080/api/health || echo "  健康检查失败"
REMOTE

  sleep 2
  do_check
}

# ── 主逻辑 ──
case "$CMD" in
  check)
    do_check
    ;;
  restart)
    do_restart
    ;;
  force)
    echo -e "${YELLOW}⚠️  强制恢复将杀死所有后端进程并重建${NC}"
    do_force
    ;;
  logs)
    do_logs
    ;;
  full)
    echo -e "${YELLOW}⚠️  完整恢复将重新构建并重启所有服务${NC}"
    do_full
    ;;
  *)
    echo "用法: ./scripts/emergency.sh [check|restart|force|logs|full]"
    echo ""
    echo "  check   - 健康检查（默认）"
    echo "  restart - PM2 优雅重启"
    echo "  force   - 强杀进程 + 重建 + 重启"
    echo "  logs    - 查看最近日志 + 系统状态"
    echo "  full    - 完整重新构建部署 + 验证"
    exit 1
    ;;
esac

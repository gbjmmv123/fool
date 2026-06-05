#!/usr/bin/env bash
set -euo pipefail

# ============================================================
#  安装服务端看门狗 (watchdog) 到服务器
#  - 上传 watchdog 脚本
#  - 配置 crontab 每分钟自动检测
#  - 可选: 关闭 crontab
# ============================================================

SERVER_IP="192.144.132.228"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CMD="${1:-install}"

case "$CMD" in
  install)
    echo "📦 安装 watchdog 到服务器..."
    
    echo "  1/3 上传脚本..."
    scp "$SCRIPT_DIR/watchdog.sh" root@${SERVER_IP}:/opt/watchdog-thefool.sh
    ssh root@${SERVER_IP} "chmod +x /opt/watchdog-thefool.sh"
    
    echo "  2/3 配置 crontab (每1分钟检测)..."
    ssh root@${SERVER_IP} '
      # 移除旧的 watchdog 条目（防止重复）
      crontab -l 2>/dev/null | grep -v "watchdog-thefool" | crontab - 2>/dev/null || true
      # 添加新条目
      (crontab -l 2>/dev/null || true; echo "* * * * * /opt/watchdog-thefool.sh >> /var/log/watchdog-thefool.log 2>&1") | crontab -
    '
    
    echo "  3/3 验证安装..."
    ssh root@${SERVER_IP} '
      echo "--- crontab ---"
      crontab -l | grep watchdog
      echo ""
      echo "--- 脚本存在 ---"
      ls -la /opt/watchdog-thefool.sh
    '
    
    echo ""
    echo "✅ watchdog 已安装！每分钟自动检测并恢复后端。"
    echo "   日志: /var/log/watchdog-thefool.log"
    ;;
  
  uninstall)
    echo "🗑️  卸载 watchdog..."
    ssh root@${SERVER_IP} '
      crontab -l 2>/dev/null | grep -v "watchdog-thefool" | crontab - 2>/dev/null || true
      rm -f /opt/watchdog-thefool.sh
    '
    echo "✅ watchdog 已卸载。"
    ;;
  
  status)
    echo "📊 watchdog 状态:"
    ssh root@${SERVER_IP} bash << 'REMOTE'
      echo "--- crontab ---"
      crontab -l 2>/dev/null | grep watchdog || echo "  未配置"
      echo ""
      echo "--- 脚本 ---"
      ls -la /opt/watchdog-thefool.sh 2>/dev/null || echo "  脚本不存在"
      echo ""
      echo "--- 最近日志 ---"
      tail -10 /var/log/watchdog-thefool.log 2>/dev/null || echo "  无日志"
REMOTE
    ;;
  
  *)
    echo "用法: ./scripts/install-watchdog.sh [install|uninstall|status]"
    ;;
esac

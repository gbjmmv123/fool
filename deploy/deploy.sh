#!/usr/bin/env bash
set -euo pipefail

# ============================================================
#  theFool Production Deploy Script
#  Usage: ./deploy/deploy.sh <your-domain.com>
#  Example: ./deploy/deploy.sh fool.example.com
# ============================================================

DOMAIN="${1:-}"
if [ -z "$DOMAIN" ]; then
  echo "❌ Usage: ./deploy/deploy.sh <your-domain.com>"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEPLOY_ROOT="/opt/theFool"

echo "🚀 Deploying theFool to domain: $DOMAIN"
echo "   Project root: $PROJECT_ROOT"
echo "   Deploy root : $DEPLOY_ROOT"
echo ""

# ─── 1. Build Backend ────────────────────────────────────────
echo "[1/6] Building backend..."
cd "$PROJECT_ROOT/the-fool-backend"
npm install --production=false
npm run build
echo "      Backend build done → dist/index.js"

# ─── 2. Build Frontend (SPA) ─────────────────────────────────
echo "[2/6] Building frontend (SPA)..."
cd "$PROJECT_ROOT/the-fool-frontend"
npm install
# Production API base: same-origin, so calls go through nginx reverse proxy
NUXT_PUBLIC_API_BASE='' npm run build
echo "      Frontend build done → .output/public/"

# ─── 3. Copy files to deploy directory ───────────────────────
echo "[3/6] Copying files to $DEPLOY_ROOT..."
sudo mkdir -p "$DEPLOY_ROOT/logs"

# Backend
sudo rm -rf "$DEPLOY_ROOT/the-fool-backend"
sudo cp -r "$PROJECT_ROOT/the-fool-backend" "$DEPLOY_ROOT/the-fool-backend"
sudo rm -rf "$DEPLOY_ROOT/the-fool-backend/node_modules"  # keep only prod deps below
cd "$DEPLOY_ROOT/the-fool-backend"
sudo npm install --production

# Create data dir if not exists
sudo mkdir -p "$DEPLOY_ROOT/the-fool-backend/data"
sudo touch "$DEPLOY_ROOT/the-fool-backend/data/db.sqlite"
sudo chmod 666 "$DEPLOY_ROOT/the-fool-backend/data/db.sqlite"  # rw for PM2 user

# Ensure .env exists
if [ ! -f "$DEPLOY_ROOT/the-fool-backend/.env" ]; then
  sudo cp "$PROJECT_ROOT/the-fool-backend/.env.example" "$DEPLOY_ROOT/the-fool-backend/.env"
fi

# Update .env for production
sudo sed -i "s|^CORS_ORIGINS=.*|CORS_ORIGINS=https://${DOMAIN},http://localhost:3000|" "$DEPLOY_ROOT/the-fool-backend/.env"
sudo sed -i "s|^PUBLIC_BASE_URL=.*|PUBLIC_BASE_URL=https://${DOMAIN}|" "$DEPLOY_ROOT/the-fool-backend/.env"
sudo sed -i "s|^NODE_ENV=.*|NODE_ENV=production|" "$DEPLOY_ROOT/the-fool-backend/.env"
sudo sed -i "s|^DB_PATH=.*|DB_PATH=./data/db.sqlite|" "$DEPLOY_ROOT/the-fool-backend/.env"

# Frontend
sudo rm -rf "$DEPLOY_ROOT/the-fool-frontend"
sudo mkdir -p "$DEPLOY_ROOT/the-fool-frontend"
sudo cp -r "$PROJECT_ROOT/the-fool-frontend/.output/public" "$DEPLOY_ROOT/the-fool-frontend/"

echo "      Files copied."

# ─── 4. Configure Nginx ──────────────────────────────────────
echo "[4/6] Configuring nginx..."
NGINX_CONF="$SCRIPT_DIR/nginx.conf"
sudo cp "$NGINX_CONF" /etc/nginx/sites-available/thefool

# Update domain in nginx config
sudo sed -i "s/server_name _;/server_name ${DOMAIN};/" /etc/nginx/sites-available/thefool

# Enable site
sudo ln -sf /etc/nginx/sites-available/thefool /etc/nginx/sites-enabled/thefool

# Test & reload
sudo nginx -t && sudo systemctl reload nginx
echo "      Nginx configured and reloaded."

# ─── 5. Start/Restart Backend with PM2 ───────────────────────
echo "[5/6] Starting backend with PM2..."

# Update PM2 ecosystem config with domain
PM2_CONF="$SCRIPT_DIR/ecosystem.config.cjs"
sudo cp "$PM2_CONF" "$DEPLOY_ROOT/ecosystem.config.cjs"
sudo sed -i "s|CORS_ORIGINS: .*|CORS_ORIGINS: 'https://${DOMAIN}',|" "$DEPLOY_ROOT/ecosystem.config.cjs"
sudo sed -i "s|PUBLIC_BASE_URL: .*|PUBLIC_BASE_URL: 'https://${DOMAIN}',|" "$DEPLOY_ROOT/ecosystem.config.cjs"

# Use PM2 (assumes pm2 is installed globally)
if command -v pm2 &> /dev/null; then
  pm2 delete thefool-backend 2>/dev/null || true
  pm2 start "$DEPLOY_ROOT/ecosystem.config.cjs"
  pm2 save
  pm2 startup systemd -u "$USER" --hp "$HOME" 2>/dev/null || true
  echo "      PM2 started successfully."
else
  echo "      ⚠️  PM2 not found. Please install: npm i -g pm2"
  echo "      Then run: pm2 start $DEPLOY_ROOT/ecosystem.config.cjs"
fi

# ─── 6. Done ─────────────────────────────────────────────────
echo ""
echo "✅ Deployment complete!"
echo ""
echo "   Frontend : https://${DOMAIN}"
echo "   API      : https://${DOMAIN}/api/health"
echo "   Logs     : pm2 logs thefool-backend"
echo ""
echo "   Next steps:"
echo "   1. Set up Tencent Cloud CDN pointing to this server's IP"
echo "   2. Generate QR code: node deploy/qrcode.js https://${DOMAIN}"

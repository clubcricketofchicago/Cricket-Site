#!/usr/bin/env bash
# Build + release the Next.js frontend on the VPS.
#   ./deploy/deploy.sh
# Pulls the deploy branch, installs, builds (with .env loaded so NEXT_PUBLIC_* inline),
# and restarts the systemd service. Idempotent — safe to re-run.
set -euo pipefail

APP_DIR="${APP_DIR:-/srv/cricket-site}"
BRANCH="${BRANCH:-main}"
cd "$APP_DIR"

echo "==> fetch + hard-reset to origin/$BRANCH"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"

echo "==> npm ci"
npm ci

echo "==> build (load .env first — NEXT_PUBLIC_* are inlined at build time)"
set -a; [ -f .env ] && . ./.env; set +a
# small VPSes may need this (and/or swap) so `next build` doesn't OOM
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=2048}"
npm run build

echo "==> restart service"
sudo systemctl restart cricket-site

echo "==> deployed $(git rev-parse --short HEAD)"

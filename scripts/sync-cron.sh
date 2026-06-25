#!/usr/bin/env bash
# CricClubs -> Neon sync, for a system cron on the VPS.
#
#   crontab -e:   0 */6 * * *  /srv/cricket-site/scripts/sync-cron.sh
#
# Runs the sync standalone via `npm run sync` (scripts/sync.ts) — no web server and no
# Vercel involved, so there is NO function time limit. One run at a time (flock), with
# timestamped output appended to logs/sync.log.

APP_DIR="${APP_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
LOG_DIR="${LOG_DIR:-$APP_DIR/logs}"
LOCK="${LOCK:-/tmp/ccc-sync.lock}"

# Cron runs with a minimal PATH, so node/npm may not be found. Make sure they are.
# - apt/system node: the default below is usually enough.
# - nvm: uncomment and point at your version, e.g.
#     export PATH="$HOME/.nvm/versions/node/v20.18.0/bin:$PATH"
export PATH="/usr/local/bin:/usr/bin:/bin:${PATH:-}"

mkdir -p "$LOG_DIR"
LOG="$LOG_DIR/sync.log"

{
  echo "===== $(date -u +'%FT%TZ') sync start ====="
  cd "$APP_DIR" || { echo "ERROR: cannot cd to $APP_DIR"; exit 1; }
  # -n: skip this run (don't queue) if a previous sync is still going
  flock -n "$LOCK" npm run --silent sync
  rc=$?
  echo "===== $(date -u +'%FT%TZ') sync end (exit $rc) ====="
  exit $rc
} >> "$LOG" 2>&1

#!/usr/bin/env bash
# =====================================================================
# deploy.sh - TEMPLATE. Zero-ish-downtime release for JK Balaji on the VPS.
#
# Strategy (recommended for KVM 1): BUILD ELSEWHERE (local PC or GitHub Actions), upload an artifact.
#   Building Next.js on a 1 vCPU / 4 GB box competes with live traffic and PostgreSQL.
#   Set BUILD_ON_SERVER=1 to build on the server instead (needs swap; expect several minutes).
#
# Layout on server:
#   /var/www/jkbalaji/releases/<timestamp>/   one folder per release
#   /var/www/jkbalaji/current -> releases/<x> symlink (PM2 runs from here)
#   /var/www/jkbalaji/shared/{.env files, uploads, logs}
#
# Usage:  ./deploy.sh <artifact.tar.gz>        (prebuilt)
#         BUILD_ON_SERVER=1 ./deploy.sh <git-ref>
# =====================================================================
set -Eeuo pipefail

APP_DIR="${APP_DIR:-/var/www/jkbalaji}"
RELEASES_DIR="$APP_DIR/releases"
SHARED_DIR="$APP_DIR/shared"
KEEP_RELEASES="${KEEP_RELEASES:-5}"
REPO_URL="${REPO_URL:-git@github.com:ORG/jkbalaji.git}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:4000/api/v1/health}"
TS="$(date +%Y%m%d%H%M%S)"
NEW_RELEASE="$RELEASES_DIR/$TS"

log() { printf '[deploy %s] %s\n' "$(date +%H:%M:%S)" "$*"; }
fail() { log "ERROR: $*"; exit 1; }

[[ $# -ge 1 ]] || fail "usage: deploy.sh <artifact.tar.gz | git-ref>"
mkdir -p "$RELEASES_DIR" "$SHARED_DIR/uploads" "$SHARED_DIR/logs"

log "1/8 Backup database before migrating"
"$(dirname "$0")/backup-db.sh" || fail "backup failed - aborting deploy"

log "2/8 Prepare release $NEW_RELEASE"
mkdir -p "$NEW_RELEASE"
if [[ "${BUILD_ON_SERVER:-0}" == "1" ]]; then
  git clone --depth 1 --branch "$1" "$REPO_URL" "$NEW_RELEASE"
else
  tar -xzf "$1" -C "$NEW_RELEASE"
fi

log "3/8 Link shared env, uploads, logs"
ln -sfn "$SHARED_DIR/api.env"  "$NEW_RELEASE/backend/api/.env"
ln -sfn "$SHARED_DIR/web.env"  "$NEW_RELEASE/apps/real-estate-web/.env.production"
ln -sfn "$SHARED_DIR/uploads"  "$NEW_RELEASE/uploads"
ln -sfn "$SHARED_DIR/logs"     "$NEW_RELEASE/logs"

cd "$NEW_RELEASE"
log "4/8 Install production dependencies"
# npm ci --omit=dev  (TEMPLATE: when building on server use full `npm ci` then build)
if [[ "${BUILD_ON_SERVER:-0}" == "1" ]]; then
  # npm ci
  # NODE_OPTIONS=--max-old-space-size=1536 npm run build
  # cp -r apps/web/public apps/web/.next/standalone/apps/web/public
  # cp -r apps/web/.next/static apps/web/.next/standalone/apps/web/.next/static
  :
fi

log "5/8 Prisma generate + migrate deploy"
# (cd apps/api && npx prisma generate && npx prisma migrate deploy)

log "6/8 Switch symlink"
ln -sfn "$NEW_RELEASE" "$APP_DIR/current"

log "7/8 Reload PM2"
# pm2 startOrReload "$APP_DIR/current/deploy/pm2/ecosystem.config.js" --env production --update-env
# pm2 save

log "8/8 Health check + prune old releases"
for i in {1..15}; do
  if curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then log "healthy"; break; fi
  [[ $i -eq 15 ]] && fail "health check failed - roll back: ln -sfn <previous release> $APP_DIR/current && pm2 reload all"
  sleep 2
done
ls -1dt "$RELEASES_DIR"/*/ | tail -n +$((KEEP_RELEASES + 1)) | xargs -r rm -rf

log "Done: $TS"

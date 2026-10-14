#!/usr/bin/env bash
# Post-install verification: build marker, API health, PM2 processes for selected targets.
set -euo pipefail

ROOT="${ROOT:-/root/jkbalaji}"
BUILD_TARGETS="${BUILD_TARGETS:-admin,api,re,jew}"
API_HEALTH_URL="${API_HEALTH_URL:-http://127.0.0.1:4000/api/v1/health}"
MARKER="$ROOT/logs/last-deploy-build.ok"

fail() { printf '[verify-deploy] FAILED: %s\n' "$*" >&2; exit 1; }
log() { printf '[verify-deploy] %s\n' "$*"; }

if [[ ! -f "$MARKER" ]]; then
  fail "missing build success marker ($MARKER) — npm build did not complete successfully"
fi

check_api_health=0
IFS=',' read -ra TARGETS <<< "$BUILD_TARGETS"
for raw in "${TARGETS[@]}"; do
  t="$(echo "$raw" | tr '[:upper:]' '[:lower:]' | xargs)"
  case "$t" in
    all|api|admin) check_api_health=1 ;;
  esac
done

if [[ "$check_api_health" == "1" ]]; then
  http_code="$(curl -s -o /dev/null -w '%{http_code}' "$API_HEALTH_URL" || echo "000")"
  if [[ "$http_code" != "200" ]]; then
    fail "API health returned HTTP $http_code (expected 200). Build marker exists but API is not healthy."
  fi
  log "API health: OK ($http_code)"
else
  log "API health: skipped (BUILD_TARGETS does not include api/admin/all)"
fi

IFS=',' read -ra TARGETS <<< "$BUILD_TARGETS"
for raw in "${TARGETS[@]}"; do
  t="$(echo "$raw" | tr '[:upper:]' '[:lower:]' | xargs)"
  [[ -z "$t" || "$t" == "all" || "$t" == "types" ]] && continue
  case "$t" in
    api) pm2_name="jkbalaji-api" ;;
    admin) pm2_name="jkbalaji-admin" ;;
    re|realestate|real-estate) pm2_name="jkbalaji-realestate" ;;
    jew|jewellery) pm2_name="jkbalaji-jewellery" ;;
    *) log "unknown target '$t' (skip PM2 check)"; continue ;;
  esac
  if ! pm2 describe "$pm2_name" >/dev/null 2>&1; then
    fail "PM2 process not found: $pm2_name (target $t was in BUILD_TARGETS)"
  fi
  if ! pm2 show "$pm2_name" 2>/dev/null | grep -qE 'status[[:space:]]+│[[:space:]]+online'; then
    if ! pm2 show "$pm2_name" 2>/dev/null | grep -q 'online'; then
      fail "PM2 $pm2_name is not online"
    fi
  fi
  log "PM2 $pm2_name: online"
done

log "verification passed"

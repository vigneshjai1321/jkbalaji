#!/usr/bin/env bash
set -euo pipefail

ROOT="/root/jkbalaji"
CREDS="$ROOT/PROJECT_CREDENTIALS.txt"
ENV_API="$ROOT/backend/api/.env"
ENV_RE="$ROOT/apps/real-estate-web/.env.local"
ENV_JEW="$ROOT/apps/jewellery-web/.env.local"
ENV_ADMIN="$ROOT/apps/admin-panel/.env.local"
BUILD_TARGETS="${BUILD_TARGETS:-admin,api,re,jew}"
BUILD_LOG="$ROOT/logs/last-deploy-build.log"
BUILD_OK="$ROOT/logs/last-deploy-build.ok"

mkdir -p "$ROOT/logs" "$ROOT/backups"
rm -f "$BUILD_OK"
: >"$BUILD_LOG"

log() { printf '[vps-install] %s\n' "$*" | tee -a "$BUILD_LOG"; }
fail() { log "FAILED: $*"; exit 1; }

run_build_target() {
  local name="$1"
  local cmd="$2"
  log "BUILD START: $name -> $cmd"
  if ! (cd "$ROOT" && eval "$cmd") >>"$BUILD_LOG" 2>&1; then
    fail "build target '$name' failed (see $BUILD_LOG)"
  fi
  log "BUILD OK: $name"
}

needs_types=0
needs_api=0
needs_admin=0
needs_re=0
needs_jew=0

IFS=',' read -ra _targets <<< "$BUILD_TARGETS"
for raw in "${_targets[@]}"; do
  t="$(echo "$raw" | tr '[:upper:]' '[:lower:]' | xargs)"
  case "$t" in
    all)
      needs_types=1; needs_api=1; needs_admin=1; needs_re=1; needs_jew=1
      ;;
    types) needs_types=1 ;;
    api) needs_types=1; needs_api=1 ;;
    admin) needs_types=1; needs_api=1; needs_admin=1 ;;
    re|realestate|real-estate) needs_types=1; needs_re=1 ;;
    jew|jewellery) needs_types=1; needs_jew=1 ;;
    '') ;;
    *) log "WARN: unknown BUILD_TARGETS entry '$raw' (ignored)" ;;
  esac
done

if [[ "$needs_types$needs_api$needs_admin$needs_re$needs_jew" == "00000" ]]; then
  fail "BUILD_TARGETS resolved to nothing; set BUILD_TARGETS=admin,api or all"
fi

log "BUILD_TARGETS=$BUILD_TARGETS"

if [[ ! -f "$CREDS" ]]; then
  DB_PASS="$(openssl rand -base64 32 | tr -dc 'A-Za-z0-9@#%_-' | head -c 28)"
  JWT_SECRET="$(openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | head -c 64)"
  ADMIN_PASS="${SEED_ADMIN_PASSWORD:-ChangeMe@JK2026!}"
  cat >"$CREDS" <<EOF
Admin URL: https://admin.jkbalaji.in/
Admin Username: admin@jkbalaji.in
Admin Password: ${ADMIN_PASS}
Database Name: jkbalaji
Database User: jkbalaji
Database Password: ${DB_PASS}
API URL: https://api.jkbalaji.in/api/v1
Real Estate URL: https://jkbalaji.in
Jewellery URL: https://cheyyarbalaji.com
SMTP Host: (configure)
SMTP User: (configure)
SMTP Password: (configure)
JWT Secret: (stored in backend/api/.env only)
Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
EOF
  chmod 600 "$CREDS"

  sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'jkbalaji') THEN
    CREATE ROLE jkbalaji LOGIN PASSWORD '${DB_PASS}';
  END IF;
END
\$\$;
SQL
  sudo -u postgres psql -v ON_ERROR_STOP=1 -tc "SELECT 1 FROM pg_database WHERE datname = 'jkbalaji'" | grep -q 1 \
    || sudo -u postgres createdb -O jkbalaji jkbalaji
  sudo -u postgres psql -v ON_ERROR_STOP=1 -c "GRANT ALL PRIVILEGES ON DATABASE jkbalaji TO jkbalaji;"
fi

DB_PASS="$(grep 'Database Password:' "$CREDS" | awk '{print $NF}')"

if [[ ! -f "$ENV_API" ]]; then
  if [[ -f "$ROOT/backend/api/.env.example" ]]; then
    cp "$ROOT/backend/api/.env.example" "$ENV_API"
  fi
  JWT_SECRET="$(openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | head -c 64)"
  cat >"$ENV_API" <<EOF
DATABASE_URL=postgresql://jkbalaji:${DB_PASS}@127.0.0.1:5432/jkbalaji?schema=public
JWT_SECRET=${JWT_SECRET}
APP_PORT=4000
APP_HOST=127.0.0.1
SEED_ADMIN_EMAIL=admin@jkbalaji.in
SEED_ADMIN_PASSWORD=ChangeMe@JK2026!
NODE_ENV=production
EOF
  chmod 600 "$ENV_API"
  log "Created $ENV_API (did not overwrite existing env)"
else
  log "Preserved existing $ENV_API"
fi

for pair in "$ENV_RE:https://api.jkbalaji.in/api/v1" "$ENV_JEW:https://api.jkbalaji.in/api/v1" "$ENV_ADMIN:https://admin.jkbalaji.in/api/v1"; do
  env_file="${pair%%:*}"
  pub_url="${pair##*:}"
  if [[ ! -f "$env_file" ]]; then
    cat >"$env_file" <<EOF
SERVER_API_URL=http://127.0.0.1:4000/api/v1
NEXT_PUBLIC_API_URL=${pub_url}
EOF
    log "Created $env_file"
  else
    log "Preserved existing $env_file"
  fi
done

cd "$ROOT"
export SERVER_API_URL=http://127.0.0.1:4000/api/v1

chmod +x deployment/scripts/prune-stale-paths.sh deployment/scripts/list-src-orphans.sh 2>/dev/null || true
PRUNE_DRY_RUN="${PRUNE_DRY_RUN:-0}"
run_prune_manifest() {
  local manifest_rel="$1"
  local manifest_path="$ROOT/deployment/scripts/$manifest_rel"
  case "$manifest_rel" in
    removed-src-paths*.txt) ;;
    *)
      fail "invalid STALE_PATHS_EXTRA manifest name: $manifest_rel (must match removed-src-paths*.txt)"
      ;;
  esac
  if [[ ! -f "$manifest_path" ]]; then
    log "Stale manifest not found (skip): $manifest_rel"
    return 0
  fi
  log "Prune stale paths from: $manifest_rel (PRUNE_DRY_RUN=$PRUNE_DRY_RUN)"
  DRY_RUN="$PRUNE_DRY_RUN" bash deployment/scripts/prune-stale-paths.sh "$ROOT" "$manifest_path"
}
run_prune_manifest "removed-src-paths.txt"
if [[ -n "${STALE_PATHS_EXTRA:-}" ]]; then
  run_prune_manifest "$STALE_PATHS_EXTRA"
fi

rm -rf node_modules
npm install --force --include=optional
npm install lightningcss-linux-x64-gnu @tailwindcss/oxide-linux-x64-gnu --force --no-save || true
if [[ -d node_modules/lightningcss-linux-x64-gnu ]]; then
  ln -sf ../lightningcss-linux-x64-gnu/lightningcss.linux-x64-gnu.node node_modules/lightningcss/lightningcss.linux-x64-gnu.node 2>/dev/null || true
fi

npm run db:generate >>"$BUILD_LOG" 2>&1

if [[ "${SKIP_DB_MIGRATE:-0}" != "1" ]]; then
  npm run db:migrate:deploy >>"$BUILD_LOG" 2>&1
else
  log "SKIP_DB_MIGRATE=1 (migrations skipped)"
fi

if [[ "${SKIP_DB_SEED:-}" != "1" ]]; then
  npm run db:seed >>"$BUILD_LOG" 2>&1 || true
fi

[[ "$needs_types" == "1" ]] && run_build_target "types" "npm run build:types"
[[ "$needs_api" == "1" ]] && run_build_target "api" "npm run build:api"
[[ "$needs_admin" == "1" ]] && run_build_target "admin" "npm run build:admin"
[[ "$needs_re" == "1" ]] && run_build_target "re" "npm run build:re"
[[ "$needs_jew" == "1" ]] && run_build_target "jew" "npm run build:jew"

date -u +"%Y-%m-%dT%H:%M:%SZ" >"$BUILD_OK"
log "Wrote build success marker: $BUILD_OK"

pm2 delete jkbalaji-web 2>/dev/null || true

if [[ "$needs_api" == "1" ]]; then
  pm2 delete jkbalaji-api 2>/dev/null || true
  pm2 start "$ROOT/ecosystem.config.cjs" --only jkbalaji-api
fi
if [[ "$needs_re" == "1" ]]; then
  pm2 delete jkbalaji-realestate 2>/dev/null || true
  pm2 start "$ROOT/ecosystem.config.cjs" --only jkbalaji-realestate
fi
if [[ "$needs_jew" == "1" ]]; then
  pm2 delete jkbalaji-jewellery 2>/dev/null || true
  pm2 start "$ROOT/ecosystem.config.cjs" --only jkbalaji-jewellery
fi
if [[ "$needs_admin" == "1" ]]; then
  pm2 delete jkbalaji-admin 2>/dev/null || true
  pm2 start "$ROOT/ecosystem.config.cjs" --only jkbalaji-admin
fi

pm2 save

NGINX_CONF="$ROOT/deployment/nginx/jkbalaji-ssl-live.conf"
if [[ -f /etc/letsencrypt/live/jkbalaji.in/fullchain.pem ]] && [[ -f "$ROOT/deployment/nginx/jkbalaji-ssl-live.conf" ]]; then
  NGINX_CONF="$ROOT/deployment/nginx/jkbalaji-ssl-live.conf"
elif [[ -f "$ROOT/deployment/nginx/jkbalaji-http-only.conf" ]]; then
  NGINX_CONF="$ROOT/deployment/nginx/jkbalaji-http-only.conf"
fi
if [[ -f "$NGINX_CONF" ]]; then
  cp "$NGINX_CONF" /etc/nginx/sites-available/jkbalaji.conf
  if [[ -f /etc/letsencrypt/live/jkbalaji.in-0001/fullchain.pem ]]; then
    sed -i 's|/etc/letsencrypt/live/jkbalaji.in/|/etc/letsencrypt/live/jkbalaji.in-0001/|g' /etc/nginx/sites-available/jkbalaji.conf
  fi
  ln -sf /etc/nginx/sites-available/jkbalaji.conf /etc/nginx/sites-enabled/jkbalaji.conf
  rm -f /etc/nginx/sites-enabled/default
  nginx -t
  systemctl reload nginx
fi

pm2 startup systemd -u root --hp /root 2>/dev/null | tail -1 | bash 2>/dev/null || true

export BUILD_TARGETS
export ROOT
bash "$ROOT/deployment/scripts/verify-deploy.sh"

log "VPS install complete."

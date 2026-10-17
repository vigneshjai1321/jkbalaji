#!/usr/bin/env bash
# Safe fixture test for prune-stale-paths.sh (does not touch production).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PRUNE="$SCRIPT_DIR/prune-stale-paths.sh"
FIXTURE="$(mktemp -d)"
trap 'rm -rf "$FIXTURE"' EXIT

mkdir -p "$FIXTURE/deployment/scripts"
cp "$SCRIPT_DIR/prune-stale-paths.lib.sh" "$FIXTURE/deployment/scripts/"
cp "$PRUNE" "$FIXTURE/deployment/scripts/prune-stale-paths.sh"
echo '{"name":"jkbalaji"}' >"$FIXTURE/package.json"

mkdir -p "$FIXTURE/apps/real-estate-web/src/app/admin"
mkdir -p "$FIXTURE/safe-runtime/uploads"
mkdir -p "$FIXTURE/backups"
echo keep >"$FIXTURE/safe-runtime/uploads/customer.pdf"
echo stale >"$FIXTURE/apps/real-estate-web/src/app/admin/page.tsx"
echo backup >"$FIXTURE/backups/pre_deploy_test.tgz"

MANIFEST="$FIXTURE/manifest.txt"
cat >"$MANIFEST" <<'EOF'
apps/real-estate-web/src/app/admin
../outside.txt
backups/pre_deploy_test.tgz
package.json
EOF

if DRY_RUN=1 PRUNE_STRICT=1 bash "$FIXTURE/deployment/scripts/prune-stale-paths.sh" "$FIXTURE" "$MANIFEST"; then
  echo "expected strict manifest to fail"
  exit 1
fi

[[ -d "$FIXTURE/apps/real-estate-web/src/app/admin" ]] || exit 1
[[ -f "$FIXTURE/backups/pre_deploy_test.tgz" ]] || exit 1

cat >"$MANIFEST" <<'EOF'
apps/real-estate-web/src/app/admin
EOF

dry_out="$(DRY_RUN=1 PRUNE_STRICT=1 bash "$FIXTURE/deployment/scripts/prune-stale-paths.sh" "$FIXTURE" "$MANIFEST")"
case "$dry_out" in
  *'DRY-RUN would remove: apps/real-estate-web/src/app/admin'*) ;;
  *)
    echo "expected DRY-RUN line missing"
    echo "$dry_out"
    exit 1
    ;;
esac

DRY_RUN=0 PRUNE_STRICT=1 bash "$FIXTURE/deployment/scripts/prune-stale-paths.sh" "$FIXTURE" "$MANIFEST"

[[ ! -e "$FIXTURE/apps/real-estate-web/src/app/admin" ]] || exit 1
[[ -f "$FIXTURE/safe-runtime/uploads/customer.pdf" ]] || exit 1

# Idempotent second run
DRY_RUN=0 PRUNE_STRICT=1 bash "$FIXTURE/deployment/scripts/prune-stale-paths.sh" "$FIXTURE" "$MANIFEST"

echo "prune-stale-paths.test.sh: OK"

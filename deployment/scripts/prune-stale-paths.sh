#!/usr/bin/env bash
# Remove explicit stale source paths listed in a manifest (no wildcards).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=prune-stale-paths.lib.sh
. "$SCRIPT_DIR/prune-stale-paths.lib.sh"

ROOT="${1:-/root/jkbalaji}"
MANIFEST="${2:-$ROOT/deployment/scripts/removed-src-paths.txt}"
DRY_RUN="${DRY_RUN:-0}"
PRUNE_STRICT="${PRUNE_STRICT:-1}"

if [[ ! -f "$MANIFEST" ]]; then
  prune_log "manifest not found: $MANIFEST (skip)"
  exit 0
fi

prune_validate_root "$ROOT" || exit 2

ROOT_REAL="$(cd "$ROOT" && pwd -P)"
invalid=0
declare -a TO_REMOVE=()

while IFS= read -r line || [[ -n "$line" ]]; do
  line="${line%%#*}"
  line="$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
  [[ -z "$line" ]] && continue

  if ! prune_validate_manifest_line "$line"; then
    invalid=$((invalid + 1))
    continue
  fi

  target="$ROOT/$line"
  [[ ! -e "$target" ]] && continue

  target_parent="$(dirname "$target")"
  target_base="$(basename "$target")"
  target_real="$(cd "$target_parent" 2>/dev/null && pwd -P)/$target_base" || {
    prune_log "SKIP cannot resolve: $line"
    continue
  }
  case "$target_real" in
    "$ROOT_REAL"/*) TO_REMOVE+=("$line") ;;
    *)
      prune_log "SKIP outside project root: $line"
      invalid=$((invalid + 1))
      ;;
  esac
done < "$MANIFEST"

if [[ "$invalid" -gt 0 && "$PRUNE_STRICT" == "1" ]]; then
  prune_log "FATAL: manifest had $invalid invalid/refused line(s); no deletions applied"
  exit 3
fi

removed=0
for line in "${TO_REMOVE[@]}"; do
  if [[ "$DRY_RUN" == "1" ]]; then
    prune_log "DRY-RUN would remove: $line"
  else
    prune_log "Removing: $line"
    rm -rf "$ROOT/$line"
    removed=$((removed + 1))
  fi
done

prune_log "done (planned=${#TO_REMOVE[@]} removed=$removed dry_run=$DRY_RUN)"
exit 0

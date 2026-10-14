#!/usr/bin/env bash
# Remove explicit stale source paths listed in removed-src-paths.txt (no wildcards).
set -euo pipefail

ROOT="${1:-/root/jkbalaji}"
MANIFEST="${2:-$ROOT/deployment/scripts/removed-src-paths.txt}"
DRY_RUN="${DRY_RUN:-0}"

log() { printf '[prune-stale-paths] %s\n' "$*"; }

if [[ ! -f "$MANIFEST" ]]; then
  log "manifest not found: $MANIFEST (skip)"
  exit 0
fi

ROOT_REAL="$(cd "$ROOT" && pwd -P)"

while IFS= read -r line || [[ -n "$line" ]]; do
  line="${line%%#*}"
  line="$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
  [[ -z "$line" ]] && continue

  if [[ "$line" == /* ]]; then
    log "SKIP absolute path (not allowed): $line"
    continue
  fi
  if [[ "$line" == *".."* ]]; then
    log "SKIP path with parent traversal: $line"
    continue
  fi
  if [[ "$line" == *"*"* ]] || [[ "$line" == *"?"* ]]; then
    log "SKIP wildcard path: $line"
    continue
  fi

  target="$ROOT/$line"
  if [[ ! -e "$target" ]]; then
    continue
  fi

  target_real="$(cd "$(dirname "$target")" 2>/dev/null && pwd -P)/$(basename "$target")" || {
    log "SKIP cannot resolve: $line"
    continue
  }
  case "$target_real" in
    "$ROOT_REAL"/*) ;;
    *)
      log "SKIP outside project root: $line"
      continue
      ;;
  esac

  if [[ "$DRY_RUN" == "1" ]]; then
    log "DRY-RUN would remove: $line"
  else
    log "Removing: $line"
    rm -rf "$target"
  fi
done < "$MANIFEST"

log "done"

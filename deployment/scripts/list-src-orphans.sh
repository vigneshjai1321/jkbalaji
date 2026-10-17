#!/usr/bin/env bash
# Read-only: list repo-relative source paths on disk that are not in the release file list (stdin, one path per line).
# Usage (local):
#   git ls-files > /tmp/release.txt
#   ssh root@host 'bash /root/jkbalaji/deployment/scripts/list-src-orphans.sh /root/jkbalaji' < /tmp/release.txt
set -euo pipefail

ROOT="${1:-.}"
ROOT_REAL="$(cd "$ROOT" && pwd -P)"

declare -A IN_RELEASE=()
while IFS= read -r line || [[ -n "$line" ]]; do
  line="${line%%#*}"
  line="$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
  [[ -z "$line" ]] && continue
  IN_RELEASE["$line"]=1
done

scan_tree() {
  local base="$1"
  [[ -d "$ROOT/$base" ]] || return 0
  while IFS= read -r -d '' f; do
    rel="${f#"$ROOT"/}"
    rel="${rel#./}"
    [[ -n "${IN_RELEASE[$rel]:-}" ]] && continue
    printf '%s\n' "$rel"
  done < <(find "$ROOT/$base" -type f ! -path '*/node_modules/*' ! -path '*/.next/*' ! -path '*/dist/*' -print0 2>/dev/null)
}

scan_tree "apps/admin-panel/src"
scan_tree "apps/real-estate-web/src"
scan_tree "apps/jewellery-web/src"
scan_tree "backend/api/src"

log() { printf '[list-src-orphans] %s\n' "$*" >&2; }
log "root=$ROOT_REAL (release paths loaded: ${#IN_RELEASE[@]})"

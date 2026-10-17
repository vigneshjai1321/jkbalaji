# Shared validation helpers for prune-stale-paths.sh (source with `.`).

prune_log() { printf '[prune-stale-paths] %s\n' "$*"; }

prune_validate_root() {
  local root="$1"
  if [[ ! -d "$root" ]]; then
    prune_log "FATAL: ROOT is not a directory: $root"
    return 1
  fi
  if [[ ! -f "$root/package.json" ]] || [[ ! -d "$root/deployment/scripts" ]]; then
    prune_log "FATAL: ROOT does not look like JKBalaji project root (need package.json + deployment/scripts)"
    return 1
  fi
  return 0
}

# Exit 0 => path is protected and must not be pruned.
prune_is_protected_path() {
  local line="$1"
  case "$line" in
    backups|backups/*|uploads|uploads/*|node_modules|node_modules/*|logs|logs/*)
      return 0
      ;;
    package.json|package-lock.json|ecosystem.config.cjs|PROJECT_CREDENTIALS.txt|PROJECT_CREDENTIALS.example.txt)
      return 0
      ;;
    */.env|*/.env.*|.env|.env.*)
      return 0
      ;;
    database|database/prisma|database/prisma/*)
      return 0
      ;;
  esac
  return 1
}

# Exit 0 => path is allowed in a stale manifest (explicit source-only trees).
prune_is_allowed_manifest_path() {
  local line="$1"
  case "$line" in
    apps/*|backend/*|packages/*|database/migrations/*)
      return 0
      ;;
  esac
  return 1
}

prune_validate_manifest_line() {
  local line="$1"
  if [[ -z "$line" ]]; then
    return 1
  fi
  if [[ "$line" == /* ]]; then
    prune_log "INVALID absolute path: $line"
    return 1
  fi
  if [[ "$line" == *".."* ]]; then
    prune_log "INVALID parent traversal: $line"
    return 1
  fi
  if [[ "$line" == *"*"* ]] || [[ "$line" == *"?"* ]]; then
    prune_log "INVALID wildcard: $line"
    return 1
  fi
  if prune_is_protected_path "$line"; then
    prune_log "REFUSE protected path: $line"
    return 1
  fi
  if ! prune_is_allowed_manifest_path "$line"; then
    prune_log "REFUSE path outside allowed source trees: $line"
    return 1
  fi
  return 0
}

#!/usr/bin/env bash
# =====================================================================
# backup-db.sh - TEMPLATE. Compressed logical backup of the JK Balaji PostgreSQL DB.
# Schedule (crontab -e as the deploy user), daily 02:30 IST:
#   30 2 * * * /var/www/jkbalaji/current/deploy/scripts/backup-db.sh >> /var/www/jkbalaji/shared/logs/backup.log 2>&1
# Credentials: use ~/.pgpass (chmod 600) - never put passwords in this file.
# Off-site copy: Hostinger weekly VPS backups are NOT enough for financial data -
#   sync $BACKUP_DIR to object storage / another server (rclone) - see docs/deployment/HOSTINGER-VPS.md.
# =====================================================================
set -Eeuo pipefail

DB_NAME="${DB_NAME:-jkbalaji}"
DB_USER="${DB_USER:-jkbalaji_app}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/jkbalaji}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
TS="$(date +%Y%m%d-%H%M%S)"
FILE="$BACKUP_DIR/${DB_NAME}-${TS}.dump"

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

echo "[backup] $(date -Is) dumping $DB_NAME -> $FILE"
# Custom format (-Fc) is compressed and restorable selectively with pg_restore.
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -Fc --no-owner -f "$FILE"

# Verify the archive is readable
pg_restore --list "$FILE" >/dev/null

echo "[backup] pruning files older than $RETENTION_DAYS days"
find "$BACKUP_DIR" -name "${DB_NAME}-*.dump" -type f -mtime +"$RETENTION_DAYS" -delete

# Off-site (TEMPLATE): rclone copy "$FILE" remote:jkbalaji-backups/
echo "[backup] done ($(du -h "$FILE" | cut -f1))"

# Restore (manual):
#   pg_restore -h 127.0.0.1 -U jkbalaji_app -d jkbalaji --clean --if-exists <file>.dump

#!/usr/bin/env bash
# Read-only: list active admin emails (no passwords).
set -euo pipefail
sudo -u postgres psql -d jkbalaji -t -A -F $'\t' -c \
  "SELECT email, role FROM users WHERE is_active = true AND role IN ('SUPER_ADMIN','ADMIN') ORDER BY email;"

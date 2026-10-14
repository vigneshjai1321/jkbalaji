#!/usr/bin/env bash
set -euo pipefail
BASE="${1:-http://127.0.0.1:4000/api/v1}"
EMAIL="${2:-admin@jkbalaji.in}"
PASS="${3:-ChangeMe@JK2026!}"

json=$(curl -s -X POST "$BASE/auth/login" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}")
token=$(printf '%s' "$json" | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')
if [[ -z "$token" ]]; then
  echo "LOGIN_FAILED: $json"
  exit 1
fi
echo "login:ok token_len=${#token}"
curl -s -o /dev/null -w "me:%{http_code}\n" -H "Authorization: Bearer $token" "$BASE/auth/me"
curl -s -o /dev/null -w "dashboard:%{http_code}\n" -H "Authorization: Bearer $token" "$BASE/admin/dashboard"
curl -s -o /dev/null -w "leads:%{http_code}\n" -H "Authorization: Bearer $token" "$BASE/admin/leads"

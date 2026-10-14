#!/bin/bash
set -e
RESP=$(curl -s -X POST http://127.0.0.1:4000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@jkbalaji.in","password":"ChangeMe@JK2026!"}')
TOKEN=$(node -e "const j=JSON.parse(process.argv[1]); console.log(j.accessToken||'')" "$RESP")
echo "login_ok=$([ -n "$TOKEN" ] && echo yes || echo no)"
curl -s -o /dev/null -w "dashboard:%{http_code}\n" -H "Authorization: Bearer $TOKEN" http://127.0.0.1:4000/api/v1/admin/dashboard
curl -s -o /dev/null -w "auth_me:%{http_code}\n" -H "Authorization: Bearer $TOKEN" http://127.0.0.1:4000/api/v1/auth/me

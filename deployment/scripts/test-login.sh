#!/bin/bash
curl -s -w "\nHTTP:%{http_code}\n" -X POST http://127.0.0.1:4000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@jkbalaji.in","password":"ChangeMe@JK2026!"}'

#!/usr/bin/env bash
set -euo pipefail

API_BASE="${API_BASE:-https://okpupsbackend-7gv3.onrender.com}"
EMAIL="${ADMIN_EMAIL:-${EMAIL:-}}"
PASSWORD="${ADMIN_PASSWORD:-${PASSWORD:-}}"
COOKIE_JAR="${COOKIE_JAR:-/tmp/okpups-cookie.txt}"

if [[ -z "${EMAIL}" || -z "${PASSWORD}" ]]; then
  echo "Missing credentials. Set ADMIN_EMAIL + ADMIN_PASSWORD (or EMAIL + PASSWORD)." >&2
  exit 2
fi

rm -f "$COOKIE_JAR"

echo "==> POST /auth/login"
login_status=$(curl -sS -o /tmp/okpups-login.json -w "%{http_code}" \
  -c "$COOKIE_JAR" \
  -H "Content-Type: application/json" \
  -X POST "$API_BASE/auth/login" \
  --data "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo "HTTP $login_status"
cat /tmp/okpups-login.json || true
echo

echo "==> GET /auth/me (with cookie jar)"
me_status=$(curl -sS -o /tmp/okpups-me.json -w "%{http_code}" \
  -b "$COOKIE_JAR" \
  "$API_BASE/auth/me")

echo "HTTP $me_status"
cat /tmp/okpups-me.json || true
echo

echo "==> Cookie jar saved at: $COOKIE_JAR"

echo "Tip: if /auth/me returns 401, inspect Set-Cookie from login with:" 
echo "  curl -i -H 'Content-Type: application/json' -X POST $API_BASE/auth/login --data '{\"email\":\"...\",\"password\":\"...\"}'"
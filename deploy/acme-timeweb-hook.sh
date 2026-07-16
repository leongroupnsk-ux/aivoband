#!/usr/bin/env bash
# DNS-01 auth-hook для certbot: ставит TXT-запись через API Timeweb и ждёт публикации.
# Токен API: файл /root/.tw-token (chmod 600), путь переопределяется TW_TOKEN_FILE.
# Схема API проверена на живом аккаунте 17.07.2026 (flat: type/subdomain/value/ttl).
set -eu

TOKEN_FILE="${TW_TOKEN_FILE:-/root/.tw-token}"
TOKEN=$(cat "$TOKEN_FILE")
FQDN="aivo.band"
API="https://api.timeweb.cloud/api/v1/domains/${FQDN}/dns-records"

SUB="_acme-challenge"
case "${CERTBOT_DOMAIN}" in www.*) SUB="_acme-challenge.www" ;; esac

auth() { curl -fsS -m 20 -H "Authorization: Bearer ${TOKEN}" "$@"; }

# снести старые TXT этого сабдомена (протухшие токены прошлых попыток, авто-SPF)
for id in $(auth "$API" | python3 -c "
import sys, json
for r in json.load(sys.stdin)['dns_records']:
    if r['type'] == 'TXT' and r['data'].get('subdomain') == '${SUB}':
        print(r['id'])
"); do
  auth -X DELETE "$API/$id" >/dev/null || true
done

# поставить свежий токен
auth -X POST "$API" -H "Content-Type: application/json" \
  -d "{\"type\":\"TXT\",\"subdomain\":\"${SUB}\",\"value\":\"${CERTBOT_VALIDATION}\",\"ttl\":60}" >/dev/null
echo ">>> TXT ${SUB}.${FQDN} установлена через API, жду публикации..."

for i in $(seq 1 90); do
  if dig +time=4 +tries=1 @1.1.1.1 +short "${SUB}.${FQDN}" TXT 2>/dev/null | grep -q "${CERTBOT_VALIDATION}"; then
    echo ">>> Опубликована. Страховочная пауза 20 сек."
    sleep 20
    exit 0
  fi
  sleep 15
done

echo ">>> TXT не опубликовалась за ~23 минуты" >&2
exit 1

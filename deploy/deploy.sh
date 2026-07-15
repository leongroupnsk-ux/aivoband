#!/usr/bin/env bash
# Деплой с локальной машины на VPS (без git-remote): rsync кода + сборка в Docker.
#   bash deploy/deploy.sh root@<ip-сервера>
# Перед первым запуском: на сервере выполнен setup-server.sh,
# в site/.env заполнены TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, NEXT_PUBLIC_SITE_URL.
set -euo pipefail

HOST="${1:?Использование: bash deploy/deploy.sh root@<ip>}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [[ ! -f "$ROOT/site/.env" ]]; then
  echo "!! Нет site/.env — скопируйте site/.env.example в site/.env и заполните" >&2
  exit 1
fi

echo "==> rsync кода на $HOST"
rsync -az --delete \
  --exclude node_modules --exclude .next --exclude .git \
  "$ROOT/site/" "$HOST:/opt/aivo/site/"

echo "==> сборка и перезапуск контейнера"
ssh "$HOST" 'cd /opt/aivo/site && docker compose up -d --build && docker image prune -f'

echo "==> проверка"
ssh "$HOST" 'sleep 3 && curl -s -o /dev/null -w "local http: %{http_code}\n" http://127.0.0.1:3000/'
echo "Готово. Если SSL ещё не выпущен: ssh $HOST 'certbot --nginx -d <домен> --redirect'"

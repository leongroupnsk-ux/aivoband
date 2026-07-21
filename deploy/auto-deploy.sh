#!/usr/bin/env bash
# Автодеплой aivo.band: сервер сам опрашивает GitHub и пересобирается при новом коммите.
#
# Почему опрос, а не GitHub Actions по SSH: на сервере включён гео-фильтр входящего
# зарубежного трафика, а раннеры GitHub — американские, достучаться до сервера они не смогут.
# Исходящие запросы работают, поэтому инициатором делаем сервер.
#
# Установка (разово):
#   chmod +x /opt/aivo/deploy/auto-deploy.sh
#   (crontab -l 2>/dev/null; echo "*/5 * * * * /opt/aivo/deploy/auto-deploy.sh >> /var/log/aivo-deploy.log 2>&1") | crontab -
#
# Ручной прогон:  /opt/aivo/deploy/auto-deploy.sh
# Принудительно:  FORCE=1 /opt/aivo/deploy/auto-deploy.sh
# Лог:            tail -f /var/log/aivo-deploy.log

set -euo pipefail

REPO="${REPO:-leongroupnsk-ux/aivoband}"
BRANCH="${BRANCH:-main}"
APP_DIR="${APP_DIR:-/opt/aivo}"
SITE_DIR="$APP_DIR/site"
STATE_FILE="$APP_DIR/.deployed-sha"
LOCK_FILE="/tmp/aivo-deploy.lock"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3000/}"

log() { echo "$(date -Iseconds) $*"; }

# Не запускаем два деплоя одновременно (сборка идёт минуты, крон тикает каждые 5).
# flock есть не везде, поэтому предусмотрен запасной вариант на mkdir —
# иначе при его отсутствии скрипт молча решал бы, что деплой уже идёт, и не работал.
LOCK_DIR="${LOCK_FILE}.d"
if command -v flock >/dev/null 2>&1; then
  exec 9>"$LOCK_FILE"
  if ! flock -n 9; then
    log "пропуск: деплой уже идёт"
    exit 0
  fi
else
  if ! mkdir "$LOCK_DIR" 2>/dev/null; then
    # снимаем зависшую блокировку старше 30 минут (сборка столько не идёт)
    if [ -n "$(find "$LOCK_DIR" -maxdepth 0 -mmin +30 2>/dev/null)" ]; then
      log "снимаю зависшую блокировку"
      rmdir "$LOCK_DIR" 2>/dev/null || true
      mkdir "$LOCK_DIR" 2>/dev/null || { log "пропуск: не удалось взять блокировку"; exit 0; }
    else
      log "пропуск: деплой уже идёт"
      exit 0
    fi
  fi
  trap 'rmdir "$LOCK_DIR" 2>/dev/null || true' EXIT
fi

# 1. Какой сейчас коммит в ветке
remote_sha=$(curl -fsS --max-time 30 \
  "https://api.github.com/repos/$REPO/commits/$BRANCH" \
  -H "Accept: application/vnd.github.sha" 2>/dev/null || true)

if [ -z "$remote_sha" ]; then
  log "ошибка: не удалось получить коммит с GitHub (сеть или лимит API) — пропускаем"
  exit 0
fi

current_sha=$(cat "$STATE_FILE" 2>/dev/null || echo "")

if [ "$remote_sha" = "$current_sha" ] && [ "${FORCE:-0}" != "1" ]; then
  exit 0   # изменений нет, молчим, чтобы не засорять лог
fi

prev_short="${current_sha:0:8}"
log "новый коммит ${remote_sha:0:8} (было ${prev_short:-нет}) — обновляемся"

# 2. Скачиваем и раскладываем. .env не входит в архив, поэтому переживает обновление.
cd "$APP_DIR"
if ! curl -fsSL --max-time 120 \
  "https://codeload.github.com/$REPO/tar.gz/refs/heads/$BRANCH" | tar -xz --strip-components=1; then
  log "ошибка: не удалось скачать или распаковать архив — прод не тронут"
  exit 1
fi

# 3. Пересборка. Если сборка упадёт, старый контейнер продолжит работать —
#    docker compose подменяет контейнер только после успешной сборки образа.
cd "$SITE_DIR"
if ! docker compose up -d --build; then
  log "ОШИБКА СБОРКИ — сайт продолжает работать на прежней версии, sha не обновляем"
  exit 1
fi

# 4. Проверка живости
sleep 8
code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "$HEALTH_URL" || echo "000")
if [ "$code" != "200" ]; then
  log "ОШИБКА: после пересборки сайт отвечает $code — проверьте docker compose logs"
  exit 1
fi

echo "$remote_sha" > "$STATE_FILE"
log "готово: развёрнут ${remote_sha:0:8}, сайт отвечает 200"

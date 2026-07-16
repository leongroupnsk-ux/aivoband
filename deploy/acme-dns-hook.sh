#!/usr/bin/env bash
# ACME DNS-01 auth-hook для certbot (ручное добавление TXT в панель Timeweb).
# Печатает имя/значение записи и сам ждёт её публикации в DNS — Enter не нужен.
# Использование: certbot certonly --manual --preferred-challenges dns \
#   --manual-auth-hook /root/hook.sh -d aivo.band -d www.aivo.band ...
set -u

NAME="_acme-challenge.${CERTBOT_DOMAIN}"

echo ""
echo "=============================================================================="
echo ">>> ДОБАВЬ/ИЗМЕНИ TXT-ЗАПИСЬ В ПАНЕЛИ TIMEWEB (Домены → aivo.band → DNS):"
echo ">>>"
echo ">>>   имя:      ${NAME}"
echo ">>>   значение: ${CERTBOT_VALIDATION}"
echo ">>>"
echo ">>> Никаких Enter не нужно — я сам жду публикации (проверка каждые 20 сек,"
echo ">>> лимит 40 минут). Просто сохрани запись в панели и жди."
echo "=============================================================================="

for i in $(seq 1 120); do
  if dig +time=4 +tries=1 @1.1.1.1 +short "${NAME}" TXT 2>/dev/null | grep -q "${CERTBOT_VALIDATION}"; then
    echo ">>> Запись опубликована. Держу паузу 30 сек для надёжности..."
    sleep 30
    echo ">>> Продолжаю выпуск."
    exit 0
  fi
  sleep 20
done

echo ">>> ОШИБКА: запись не появилась в DNS за 40 минут (${NAME})" >&2
exit 1

#!/usr/bin/env bash
# Финализация: чистый nginx-конфиг (редирект + www + HSTS) и автопродление сертификата.
set -eu

# 1. Заменить vhost чистым конфигом, убрать промежуточный certbot-конфиг
install -m 644 /opt/aivo/deploy/nginx-aivo.conf /etc/nginx/sites-available/aivo
ln -sf /etc/nginx/sites-available/aivo /etc/nginx/sites-enabled/aivo
rm -f /etc/nginx/sites-enabled/aivo-ssl
nginx -t && systemctl reload nginx
echo ">>> nginx обновлён (редирект + www + HSTS)"

# 2. Автоперезагрузка nginx после автопродления сертификата
mkdir -p /etc/letsencrypt/renewal-hooks/deploy
printf '#!/bin/sh\nsystemctl reload nginx\n' > /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
echo ">>> deploy-hook для перезагрузки nginx установлен"

# 3. Проверка, что таймер автопродления активен
systemctl is-enabled certbot.timer 2>/dev/null && echo ">>> certbot.timer активен (автопродление 2×/сутки)" || echo ">>> ВНИМАНИЕ: certbot.timer не активен"

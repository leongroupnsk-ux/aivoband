#!/usr/bin/env bash
# Первичная настройка VPS (Timeweb Cloud, Ubuntu 24.04 LTS). Запускать от root ОДИН раз:
#   DOMAIN=aivo.example bash setup-server.sh
set -euo pipefail

DOMAIN="${DOMAIN:?Укажите домен: DOMAIN=aivo.example bash setup-server.sh}"

echo "==> Пакеты"
export DEBIAN_FRONTEND=noninteractive
apt-get update -q
apt-get install -yq docker.io docker-compose-v2 nginx certbot python3-certbot-nginx ufw rsync

echo "==> Файрвол"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "==> Каталог приложения"
mkdir -p /opt/aivo

echo "==> nginx"
cat > /etc/nginx/sites-available/aivo <<NGINX
server {
    listen 80;
    server_name ${DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX
ln -sf /etc/nginx/sites-available/aivo /etc/nginx/sites-enabled/aivo
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "==> Готово. Дальше:"
echo "  1) убедиться, что A-запись ${DOMAIN} указывает на этот сервер"
echo "  2) с локальной машины: bash deploy/deploy.sh <ip-или-host> — доставка кода и запуск"
echo "  3) здесь: certbot --nginx -d ${DOMAIN} --redirect  (SSL + редирект на https)"

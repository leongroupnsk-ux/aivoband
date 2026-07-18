#!/usr/bin/env bash
# Бэкап заявок админки (том aivo-data). В крон:
#   0 4 * * * /opt/aivo/deploy/backup-data.sh >> /var/log/aivo-backup.log 2>&1
# Держим 30 последних копий.
set -eu

DEST="${BACKUP_DIR:-/opt/aivo/backups}"
VOLUME="site_aivo-data"   # имя тома = <проект>_<volume>; проверить: docker volume ls
mkdir -p "$DEST"
STAMP=$(date +%Y%m%d-%H%M%S)

docker run --rm -v "${VOLUME}:/data:ro" -v "${DEST}:/backup" alpine \
  tar czf "/backup/leads-${STAMP}.tar.gz" -C /data .

# ротация: оставить 30 свежих
ls -1t "${DEST}"/leads-*.tar.gz 2>/dev/null | tail -n +31 | xargs -r rm -f
echo "$(date -Iseconds) backup ok: leads-${STAMP}.tar.gz"

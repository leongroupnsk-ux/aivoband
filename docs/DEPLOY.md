# Деплой сайта Aivo на прод

Сайт — Next.js 16, почти весь статический (33 SSG-страницы). Серверная часть минимальна: `/api/lead` (заявки → Telegram) и `/rss.xml`. Тяжёлое железо не нужно.

## Вариант A — Vercel (рекомендация ТЗ §8)

Сервер не нужен вообще: платформа собирает и хостит сама, CDN и SSL из коробки.

1. Репозиторий на GitHub/GitLab → «Import Project» на vercel.com, корень — `site/`.
2. Env-переменные в настройках проекта: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `NEXT_PUBLIC_SITE_URL=https://<домен>`.
3. Подключить домен (A/CNAME-записи покажет Vercel), SSL автоматом.
4. Каждый push в main = автодеплой; превью-деплой на каждый PR.

- Тариф: Hobby бесплатный, но для коммерческого сайта нужен **Pro ($20/мес)**.
- ⚠️ Оплата зарубежной картой; для РФ-аудитории задержки CDN некритичны, но провайдер вне юрисдикции РФ — если для заказчика важно 152-ФЗ-размещение, выбирать вариант B.

## ✅ Выбранный вариант: Timeweb Cloud

**Создание сервера в панели (timeweb.cloud → Облачные серверы → Создать):**

1. ОС: **Ubuntu 24.04 LTS** (чистая, без панелей и маркетплейс-приложений).
2. Конфигурация: **2 vCPU / 2 ГБ RAM / ≥20 ГБ NVMe** (комфортный тариф; минимальный 1 vCPU/1 ГБ тоже заведётся).
3. Регион: Санкт-Петербург или Москва — что ближе к аудитории.
4. SSH-ключ: добавить публичный ключ при создании (Настройки → SSH-ключи). Доступ по паролю лучше сразу выключить.
5. После создания записать **IP сервера**.

**DNS:** у регистратора домена — A-запись `@` (и `www`, если нужен) → IP сервера. TTL поменьше (300–600с) на время запуска.

**Разворачивание (скрипты в `deploy/`):**

```bash
# 1. один раз на сервере — базовая настройка (docker, nginx, ufw)
scp deploy/setup-server.sh root@<IP>:/root/ && ssh root@<IP> 'DOMAIN=<домен> bash setup-server.sh'

# 2. локально: заполнить site/.env (Telegram-токены, NEXT_PUBLIC_SITE_URL=https://<домен>)
cp site/.env.example site/.env && $EDITOR site/.env

# 3. деплой кода (и любое последующее обновление — та же команда)
bash deploy/deploy.sh root@<IP>

# 4. один раз на сервере — SSL
ssh root@<IP> 'certbot --nginx -d <домен> --redirect'
```

Обновление сайта / публикация статьи = снова `bash deploy/deploy.sh root@<IP>`.

## Вариант B — любой другой VPS в РФ (Selectel / Beget и т.п.)

**Требования к серверу (с запасом):**

| Параметр | Минимум | Рекомендация |
|---|---|---|
| CPU | 1 vCPU | 2 vCPU |
| RAM | 1 ГБ | 2 ГБ |
| Диск | 10 ГБ SSD | 20 ГБ NVMe |
| ОС | Ubuntu 22.04/24.04 LTS | — |
| Софт | Docker + compose-плагин | + nginx, certbot |

Ориентир цены: ~400–800 ₽/мес. Standalone-сборка сайта — 62 МБ, в памяти процесс держит ~150–250 МБ.

**Шаги:**

```bash
# на сервере
apt update && apt install -y docker.io docker-compose-v2 nginx certbot python3-certbot-nginx
git clone <репозиторий> && cd aivo-site/site
cp .env.example .env   # заполнить TELEGRAM_*, NEXT_PUBLIC_SITE_URL
docker compose up -d --build   # сайт на 127.0.0.1:3000
```

nginx как reverse-proxy + SSL:

```nginx
server {
    server_name aivo.example;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;  # для rate-limit заявок
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
certbot --nginx -d aivo.example   # SSL + автопродление; HSTS включить после проверки
```

**Обновление сайта / публикация статьи:** новый `.mdx` в `content/blog/` → `git push` → на сервере `git pull && docker compose up -d --build` (sitemap и RSS пересоберутся сами). Можно повесить на GitHub Actions по push.

## Что нужно от заказчика перед запуском (оба варианта)

1. **Домен** + доступ к DNS.
2. **Telegram**: токен бота (@BotFather) и chat_id рабочего чата — для заявок.
3. Выбор хостинга: аккаунт Vercel **или** VPS (могу поднять по шагам выше).
4. Счётчики Яндекс.Метрики и GA4 (создать → прислать ID) — подключаем на этапе 8.
5. Реальный `NEXT_PUBLIC_SITE_URL` — влияет на canonical/OG/sitemap.

## Чеклист после первого деплоя

- [ ] `https://домен/` открывается, SSL валиден (+ включить HSTS).
- [ ] Тестовая заявка с /contacts дошла в Telegram-чат.
- [ ] `/sitemap.xml`, `/rss.xml`, `/robots.txt` отвечают; в robots нет `Disallow: /`.
- [ ] Sitemap отправлен в Search Console и Яндекс.Вебмастер.
- [ ] OG-превью проверено (t.me/webpagebot или opengraph.xyz).
- [ ] Lighthouse на проде ≥ целей ТЗ (локально: 99/100/100/100).

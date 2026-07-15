# Сайт ИИ-агентства Aivo

Проект по ТЗ v1.0 (`TZ-sayt-AI-agentstvo.md` в Downloads). Ориентир: 6–8 недель.

## Статус

- [x] **Этап 1 — Аналитика и структура** (артефакты ниже, ждут согласования)
- [x] **Этап 2 — Дизайн-концепт** (токены Nebula + 3 ключевых экрана, ждут согласования)
- [x] **Этап 3+4.1 — Каркас сайта на Next.js** (все страницы свёрстаны по концепту, базовые анимации)
- [x] **Этап 4.2 — Расширенные анимации** (Lenis, GSAP pin/scrub движка, page transitions, магнитные кнопки, мобильное бургер-меню)
- [x] **Этап 5 — Блог (MDX), Telegram-доставка заявок, чат-виджет** (31 страница SSG; для доставки нужны TELEGRAM_BOT_TOKEN/CHAT_ID — см. site/.env.example)
- [ ] Этап 6 — Контент (6 решений, 10 статей, 2–3 кейса)
- [x] **Этап 7 — SEO и перформанс** — Lighthouse (прод-сборка, desktop): главная Perf 99 / A11y 100 / SEO 100 / BP 100; статья Perf 99 / A11y 100; mobile Perf 88 (цели ТЗ §16: ≥90/80 Perf, ≥90 A11y, ≥95 SEO — выполнены)
- [ ] Этап 6 — Контент от заказчика (цифры, кейсы, 10 статей, юртекст /privacy, контакты)
- [ ] Этап 8 — Запуск: Vercel + домен + Метрика/GA4 (цели на CTA/формы/чат), передача доступов

## Артефакты этапа 1

| Файл | Что внутри |
|---|---|
| [docs/01-offer-i-resheniya.md](docs/01-offer-i-resheniya.md) | Главный оффер, УТП, формулировки по 6 решениям, матрица «боль → решение» |
| [docs/02-kontent-matrica.md](docs/02-kontent-matrica.md) | Копирайт-скелет: главная (11 секций), шаблон решения, процесс, контакты, FAQ, футер, чат-виджет |
| [docs/03-seo-karta.md](docs/03-seo-karta.md) | Кластеры запросов → страницы, драфты title/description, правила перелинковки |
| [docs/wireframes.html](docs/wireframes.html) | Кликабельный wireframe-прототип 6 ключевых страниц (открыть в браузере) |

## Артефакты этапа 2 (дизайн-концепт)

Просмотр: `python3 -m http.server 8742` из корня проекта → `http://127.0.0.1:8742/design/…` (или открыть файлы напрямую).

| Файл | Что внутри |
|---|---|
| [design/tokens.css](design/tokens.css) | Дизайн-токены Nebula: палитра, шрифты Outfit/Instrument Sans/Geist Mono, шкала, кнопки, карточки, header/footer. Основа Tailwind-конфига этапа 4 |
| [design/concept-home.html](design/concept-home.html) | Главная: hero с canvas-нейрографом (реакция на курсор, пауза вне вьюпорта, reduced-motion), печатающийся текст, логобар-марквиза, 6 карточек с glow, пайплайн движка со скролл-подсветкой, count-up счётчики, светлая секция «сэндвича», финальный CTA |
| [design/concept-solution.html](design/concept-solution.html) | Шаблон решения (на примере RAG): hero со схемой архитектуры, benefits, чек-лист состава, sticky-карточка цены, этапы, CTA |
| [design/concept-article.html](design/concept-article.html) | Статья блога: прогресс-бар чтения, sticky TOC с подсветкой активного раздела, код-блок с подсветкой, callout, CTA внутри статьи, блок автора, похожие статьи |

## Сайт (site/) — Next.js 16

Запуск: `cd site && npm run dev` (Turbopack). Прод-сборка: `npm run build` — проходит чисто, 20 страниц SSG.

Что готово:
- **Стек:** Next.js 16 (App Router) + TypeScript strict + Tailwind v4; токены Nebula — в `src/app/globals.css` (@theme).
- **Страницы:** главная (11 секций), /solutions + 6 решений (единый шаблон, контент в `src/data/solutions.ts`), /process, /cases + 2 кейса-плейсхолдера, /blog (заглушка до MDX), /about, /contacts, /privacy, 404.
- **Анимации (ТЗ §6):** canvas-нейрограф в hero, печатающийся текст, марквиза-логобар, reveal-on-scroll, count-up счётчики, подсветка пайплайна — всё с `prefers-reduced-motion`.
- **Формы (ТЗ §9):** `/api/lead` — honeypot + rate-limit, валидация, экран «спасибо». Проверено e2e (POST 200). Telegram/CRM/email — этап 5 (нужны токены заказчика).
- **SEO (этап 7):** canonical через metadataBase (NEXT_PUBLIC_SITE_URL), OG/Twitter-мета + генерируемое OG-изображение (`/opengraph-image`), фавиконка `icon.svg`, микроразметка Organization + WebSite + FAQPage (главная), Service + BreadcrumbList (решения), BlogPosting + BreadcrumbList (статьи). gsap/lenis вынесены из главного чанка (динамический импорт), canvas стартует по requestIdleCallback → TBT 0мс.

Анимации этапа 4.2: Lenis (инерционный скролл, синхронизирован с ScrollTrigger), GSAP pin/scrub секции движка на главной (fallback на простую подсветку для мобильных/reduced-motion), page transitions через template.tsx (fade+сдвиг, без тяжёлых библиотек), магнитные CTA в hero, мобильное бургер-меню (портал в body — backdrop-filter шапки ломает fixed-позиционирование потомков).

Блог (этап 5): MDX-файлы в `site/content/blog/` (frontmatter по модели ТЗ §7: title, excerpt, category, date, author, solution). Рендер — next-mdx-remote + Shiki (код-блоки) + remark-gfm; рубрики `/blog/category/[slug]`, клиентский поиск и фильтр, TOC с подсветкой, прогресс-бар, callout-врезки, CTA на решение из frontmatter, похожие статьи, шеринг, BlogPosting JSON-LD. RSS `/rss.xml`, авто-sitemap `/sitemap.xml`, robots.txt. Новая статья = новый .mdx-файл; 3 демо-статьи написаны, 10 статей заказчика грузятся так же. Заявки: `/api/lead` шлёт в Telegram при заданных env (см. `.env.example`), иначе логирует; чат-виджет работает в режиме fallback-формы до подключения RAG-ассистента.

Известные TODO: Outfit не имеет кириллицы (заголовки рендерятся системным гротеском — согласовать замену, напр. Onest/Unbounded, или оставить фолбэк); pin/scrub движка прогнать в обычном браузере (панель предпросмотра замораживает requestAnimationFrame — Lenis/GSAP/canvas в ней не понаблюдать).

## Ключевые решения (зафиксированы в плане, этап 0)

1. **Hero-визуал:** старт с Canvas/SVG-анимации, WebGL — второй итерацией.
2. **Контент:** MDX в репозитории; frontmatter по модели ТЗ §7 для лёгкой миграции на CMS.
3. **Заявки:** Telegram-бот + CRM/Sheets + email — нужны доступы от заказчика.

## Блокеры от заказчика (собрать до этапа 6)

- Реальные цифры для счётчиков и бейджа (число проектов, % экономии).
- Политика цен: публикуем «от …» или «рассчитать стоимость».
- Ниши/логотипы для логобара, кейсы с цифрами до/после (2–3 шт.).
- 10 готовых статей блога, брендборд Aivo, юрданные для /privacy.
- Telegram/CRM для приёма заявок.

import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Content-Security-Policy с allowlist наших сторонних сервисов.
 *
 * Почему 'unsafe-inline' в script-src: у нас есть инлайн-скрипты (инициализация
 * Метрики и GA, JSON-LD), а nonce требует middleware и ломает статические страницы.
 * Главную ценность политика даёт всё равно: скрипты грузятся только с перечисленных
 * доменов, поэтому подмешать чужой скрипт с постороннего хоста не выйдет.
 * В dev дополнительно нужен 'unsafe-eval' — на нём работает hot reload.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://aivochat.ru https://mc.yandex.ru https://yandex.ru https://www.googletagmanager.com https://*.google-analytics.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://mc.yandex.ru https://yandex.ru https://*.google-analytics.com https://www.googletagmanager.com",
  "font-src 'self' data:",
  // wss — вебвизор Метрики держит WebSocket (mc.yandex.ru/solid.ws), без него запись сессий молча не работает
  "connect-src 'self' https://aivochat.ru wss://aivochat.ru https://mc.yandex.ru wss://mc.yandex.ru https://yandex.ru https://*.google-analytics.com https://*.analytics.google.com https://stats.g.doubleclick.net",
  // чат-виджет и вебвизор Метрики открываются во фрейме
  "frame-src 'self' https://aivochat.ru https://mc.yandex.ru",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

const nextConfig: NextConfig = {
  // standalone: самодостаточная сборка для VPS/Docker (~сотни МБ вместо node_modules целиком).
  // На Vercel опция игнорируется — деплой обоими путями из одного конфига.
  output: "standalone",

  // Заголовки безопасности (ТЗ §12). HSTS — на nginx (терминирует TLS).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;

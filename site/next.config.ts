import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // standalone: самодостаточная сборка для VPS/Docker (~сотни МБ вместо node_modules целиком).
  // На Vercel опция игнорируется — деплой обоими путями из одного конфига.
  output: "standalone",

  // Базовые заголовки безопасности (ТЗ §12). HSTS — на nginx (терминирует TLS).
  // CSP пока не задаём: строгая политика ломает Метрику/GA/чат-виджет — отдельная задача.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
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

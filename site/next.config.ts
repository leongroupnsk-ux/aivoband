import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // standalone: самодостаточная сборка для VPS/Docker (~сотни МБ вместо node_modules целиком).
  // На Vercel опция игнорируется — деплой обоими путями из одного конфига.
  output: "standalone",
};

export default nextConfig;

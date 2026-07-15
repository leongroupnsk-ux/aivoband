import { getAllPosts } from "@/lib/blog";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aivo.example";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// RSS-лента блога (ТЗ §7)
export function GET() {
  const items = getAllPosts()
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${BASE}/blog/${p.slug}</link>
      <guid>${BASE}/blog/${p.slug}</guid>
      <description>${esc(p.excerpt)}</description>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Блог Aivo</title>
    <link>${BASE}/blog</link>
    <description>Как устроены ИИ-системы для бизнеса: RAG, ассистенты, внедрение.</description>
    <language>ru</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}

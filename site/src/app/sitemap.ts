import type { MetadataRoute } from "next";
import { getAllPosts, CATEGORIES } from "@/lib/blog";
import { getSolutions, getCases } from "@/lib/content-store";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aivo.example";

// Динамический sitemap: включает кейсы из рантайм-хранилища (ТЗ §7, §10)
export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const solutions = getSolutions();
  const cases = getCases();
  const staticPages = ["", "/solutions", "/process", "/cases", "/blog", "/about", "/contacts"].map((p) => ({
    url: `${BASE}${p}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));

  return [
    ...staticPages,
    ...solutions.map((s) => ({ url: `${BASE}/solutions/${s.slug}`, changeFrequency: "monthly" as const, priority: 0.9 })),
    ...cases.map((c) => ({ url: `${BASE}/cases/${c.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...getAllPosts().map((p) => ({
      url: `${BASE}/blog/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...Object.keys(CATEGORIES).map((c) => ({ url: `${BASE}/blog/category/${c}`, changeFrequency: "weekly" as const, priority: 0.5 })),
  ];
}

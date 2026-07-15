/** Хелпер микроразметки schema.org (ТЗ §10). */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aivo.example";

export const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Aivo",
  url: BASE,
  slogan: "ИИ, который не выдумывает",
  description:
    "Агентство внедрения ИИ: RAG-системы, ассистенты поддержки, ИИ-продажники, консультанты, системы под ключ и мобильные приложения.",
};

export const webSiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Aivo",
  url: BASE,
  inLanguage: "ru",
};

export function serviceLd(name: string, description: string, slug: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: `${BASE}/solutions/${slug}`,
    provider: { "@type": "Organization", name: "Aivo", url: BASE },
    areaServed: "RU",
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${BASE}${it.path}`,
    })),
  };
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIES, formatDate, getAllPosts } from "@/lib/blog";

// Категории включают рантайм-статьи → динамический рендер
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const label = CATEGORIES[slug];
  if (!label) return {};
  return {
    title: `${label} — блог Aivo`,
    description: `Статьи рубрики «${label}»: практика внедрения ИИ для бизнеса.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const label = CATEGORIES[slug];
  if (!label) notFound();

  const posts = getAllPosts().filter((p) => p.category === slug);

  return (
    <section className="section-y">
      <div className="container-site">
        <nav className="mb-6 flex gap-2 font-mono text-[12.5px] text-subtle" aria-label="Хлебные крошки">
          <Link href="/" className="hover:text-white">Главная</Link>
          <span aria-hidden>/</span>
          <Link href="/blog" className="hover:text-white">Блог</Link>
          <span aria-hidden>/</span>
          <span className="text-white">{label}</span>
        </nav>
        <span className="eyebrow">Рубрика</span>
        <h1 className="mt-4 text-[clamp(34px,4.6vw,48px)]">{label}</h1>

        {!posts.length && (
          <p className="mt-10 text-subtle">
            В этой рубрике пока пусто — загляните в <Link href="/blog" className="text-primary-l underline underline-offset-4">все статьи</Link>.
          </p>
        )}

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="card-n flex h-full flex-col" data-glow="cyan">
              <span className="font-mono text-[11.5px] text-primary-l">
                {formatDate(p.date)} · {p.readingMinutes} мин
              </span>
              <h2 className="mt-2.5 font-display text-[18px] font-semibold">{p.title}</h2>
              <p className="mt-2 flex-1 text-[14px] text-subtle">{p.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

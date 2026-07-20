import type { Metadata } from "next";
import { CATEGORIES, formatDate, getAllPosts } from "@/lib/blog";
import BlogExplorer from "@/components/BlogExplorer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Блог Aivo: как устроены ИИ-системы для бизнеса",
  description:
    "Экспертные статьи о RAG, ассистентах и внедрении ИИ — простым языком. Гайды, разборы архитектуры, кейсы.",
};

export default function BlogPage() {
  const posts = getAllPosts().map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    category: p.category,
    date: p.date,
    author: p.author,
    readingMinutes: p.readingMinutes,
    dateLabel: formatDate(p.date),
  }));

  return (
    <section className="section-y">
      <div className="container-site">
        <span className="eyebrow">Блог</span>
        <h1 className="mt-5 max-w-[22ch] text-[clamp(38px,5vw,54px)]">Разбираем ИИ по-человечески</h1>
        <p className="mt-6 max-w-[52ch] text-[18px] text-subtle">
          Как устроены RAG-системы, ассистенты и ИИ-продажники — без магии и маркетингового тумана.
        </p>
        <BlogExplorer posts={posts} categories={CATEGORIES} />
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import { CATEGORIES, formatDate, getAllPosts, getPost, getRelated } from "@/lib/blog";
import { getSolution } from "@/data/solutions";
import Callout from "@/components/mdx/Callout";
import ArticleProgress from "@/components/ArticleProgress";
import Toc from "@/components/Toc";
import ShareButtons from "@/components/ShareButtons";
import JsonLd, { breadcrumbLd } from "@/components/JsonLd";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: "article" },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const post = getPost((await params).slug);
  if (!post) notFound();

  const related = getRelated(post);
  const solution = post.solution ? getSolution(post.solution) : undefined;

  return (
    <div className="light">
      <ArticleProgress />

      <JsonLd
        data={breadcrumbLd([
          { name: "Главная", path: "/" },
          { name: "Блог", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />

      {/* schema.org BlogPosting (ТЗ §10) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            datePublished: post.date,
            author: { "@type": "Organization", name: post.author },
          }),
        }}
      />

      {/* hero статьи */}
      <header className="container-site max-w-[820px] pb-10 pt-16">
        <nav className="mb-6 flex gap-2 font-mono text-[12.5px] text-mutedc" aria-label="Хлебные крошки">
          <Link href="/" className="hover:text-body">Главная</Link>
          <span aria-hidden>/</span>
          <Link href="/blog" className="hover:text-body">Блог</Link>
          <span aria-hidden>/</span>
          <Link href={`/blog/category/${post.category}`} className="hover:text-body">
            {CATEGORIES[post.category] ?? post.category}
          </Link>
        </nav>
        <span className="eyebrow">{CATEGORIES[post.category] ?? post.category}</span>
        <h1 className="mt-4 text-[clamp(32px,4.4vw,48px)]">{post.title}</h1>
        <p className="mt-4 max-w-[58ch] text-[19px] text-mutedc">{post.excerpt}</p>
        <div className="mt-6 flex items-center gap-3.5 text-sm text-mutedc">
          <span aria-hidden className="size-10 rounded-full bg-gradient-to-br from-primary-l to-primary-d" />
          <span>
            <b className="text-body">{post.author}</b> · {formatDate(post.date)} · {post.readingMinutes} мин чтения
          </span>
        </div>
      </header>

      {/* контент + TOC */}
      <div className="container-site grid max-w-[1080px] gap-14 pb-16 lg:grid-cols-[220px_minmax(0,1fr)]">
        <Toc headings={post.headings} />
        <article className="prose-aivo">
          <MDXRemote
            source={post.content}
            components={{
              Callout,
              a: (props) => <Link href={props.href ?? "#"} {...props} />,
            }}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [rehypeSlug, [rehypePrettyCode, { theme: "one-dark-pro" }]],
              },
            }}
          />

          {/* CTA внутри статьи → релевантное решение (SEO-карта §2) */}
          {solution && (
            <aside className="my-10 flex flex-wrap items-center justify-between gap-5 rounded-[18px] bg-ink p-8 text-white">
              <div>
                <p className="font-display text-[20px] font-semibold">Хотите так же — на ваших данных?</p>
                <p className="mt-1.5 text-[14.5px] text-subtle">
                  {solution.name}: {solution.short}
                </p>
              </div>
              <Link href={`/solutions/${solution.slug}`} className="btn btn-primary btn-sm">
                Смотреть решение
              </Link>
            </aside>
          )}

          {/* автор + шеринг */}
          <footer className="mt-12 flex flex-wrap items-center gap-5 border-t border-line pt-7">
            <span aria-hidden className="size-12 rounded-full bg-gradient-to-br from-primary-l to-primary-d" />
            <div className="mr-auto">
              <b className="font-display">{post.author}</b>
              <p className="text-sm text-mutedc">Проектируем и внедряем ИИ-системы на данных клиентов.</p>
            </div>
            <ShareButtons title={post.title} />
          </footer>
        </article>
      </div>

      {/* похожие статьи */}
      {related.length > 0 && (
        <section className="container-site max-w-[1080px] pb-20">
          <span className="eyebrow">Похожие статьи</span>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {related.map((r) => (
              <Link key={r.slug} href={`/blog/${r.slug}`} className="card-n block">
                <span className="font-mono text-[11.5px] text-primary-d">{CATEGORIES[r.category] ?? r.category}</span>
                <h3 className="mt-2.5 text-[16.5px]">{r.title}</h3>
                <p className="mt-2 text-[13.5px] text-mutedc">{r.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

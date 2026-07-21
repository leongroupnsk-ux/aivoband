import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import { getScenario } from "@/lib/scenarios";
import { getSolutionBySlug } from "@/lib/content-store";
import Callout from "@/components/mdx/Callout";
import BarCompare from "@/components/mdx/BarCompare";
import Timeline from "@/components/mdx/Timeline";
import StatGrid from "@/components/mdx/StatGrid";
import ModelNote from "@/components/mdx/ModelNote";
import ArticleProgress from "@/components/ArticleProgress";
import Toc from "@/components/Toc";
import LeadForm from "@/components/LeadForm";
import JsonLd, { breadcrumbLd } from "@/components/JsonLd";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const s = getScenario((await params).slug);
  if (!s) return {};
  return {
    title: `${s.title} — сценарий внедрения`,
    description: s.tagline,
    openGraph: { title: s.title, description: s.tagline, type: "article" },
  };
}

export default async function ScenarioPage({ params }: { params: Promise<{ slug: string }> }) {
  const s = getScenario((await params).slug);
  if (!s) notFound();

  const solution = s.solution ? getSolutionBySlug(s.solution) : undefined;

  return (
    <div className="light">
      <ArticleProgress />
      <JsonLd
        data={breadcrumbLd([
          { name: "Главная", path: "/" },
          { name: "Сценарии внедрения", path: "/scenarios" },
          { name: s.title, path: `/scenarios/${s.slug}` },
        ])}
      />

      <header className="container-site max-w-[820px] pb-9 pt-16">
        <nav className="mb-6 flex gap-2 font-mono text-[12.5px] text-mutedc" aria-label="Хлебные крошки">
          <Link href="/" className="hover:text-body">Главная</Link>
          <span aria-hidden>/</span>
          <Link href="/scenarios" className="hover:text-body">Сценарии</Link>
          <span aria-hidden>/</span>
          <span className="text-body">{s.niche}</span>
        </nav>
        <span className="eyebrow">{s.niche}</span>
        <h1 className="mt-4 text-[clamp(32px,4.4vw,46px)]">{s.title}</h1>
        <p className="mt-4 max-w-[58ch] text-[19px] text-mutedc">{s.tagline}</p>
        <p className="mt-5 font-mono text-[13px] text-mutedc">Разбор · {s.readingMinutes} мин чтения</p>

        {/* Рамка жанра — на каждой странице, чтобы цифры не читались как клиентский результат */}
        <p className="mt-6 rounded-[12px] border border-dashed border-mutedc/40 bg-mutedc/5 px-4 py-3 text-[14px] text-mutedc">
          Модельный разбор: показываем подход и считаем экономику по типовым вводным отрасли.
          Это не результаты конкретного клиента — реальные кейсы собраны в разделе{" "}
          <Link href="/cases" className="underline underline-offset-2">Кейсы</Link>.
        </p>
      </header>

      <div className="container-site grid max-w-[1080px] gap-14 pb-16 lg:grid-cols-[220px_minmax(0,1fr)]">
        <Toc headings={s.headings} />
        <article className="prose-aivo">
          <MDXRemote
            source={s.content}
            components={{
              Callout,
              BarCompare,
              Timeline,
              StatGrid,
              ModelNote,
              a: (props) => <Link href={props.href ?? "#"} {...props} />,
            }}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [rehypeSlug, [rehypePrettyCode, { theme: "one-dark-pro" }]],
              },
            }}
          />

          {solution && (
            <aside className="my-10 flex flex-wrap items-center justify-between gap-5 rounded-[18px] bg-ink p-8 text-white">
              <div>
                <p className="font-display text-[20px] font-semibold">Посчитаем под вашу задачу</p>
                <p className="mt-1.5 text-[14.5px] text-subtle">
                  {solution.name}: {solution.short}
                </p>
              </div>
              <Link href={`/solutions/${solution.slug}`} className="btn btn-primary btn-sm">
                Смотреть решение
              </Link>
            </aside>
          )}
        </article>
      </div>

      <section className="section-y pt-0" id="lead">
        <div className="container-site grid max-w-[880px] items-center gap-10">
          <div className="card-n" data-glow="cyan">
            <h2 className="font-display text-[26px] font-semibold text-white">Разберём вашу задачу</h2>
            <p className="mt-3 mb-7 text-subtle">
              Расскажите, что болит — посчитаем эффект на ваших цифрах, а не на модельных.
            </p>
            <LeadForm presetSolution={s.solution} />
          </div>
        </div>
      </section>
    </div>
  );
}

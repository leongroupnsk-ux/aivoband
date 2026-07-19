import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LeadForm from "@/components/LeadForm";
import { getCaseBySlug } from "@/lib/content-store";

// Кейсы редактируются из админки в рантайме — рендерим динамически
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const c = getCaseBySlug((await params).slug);
  if (!c) return {};
  return { title: `${c.metric} — кейс ${c.niche}`, description: c.context };
}

export default async function CasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const c = getCaseBySlug((await params).slug);
  if (!c) notFound();

  return (
    <>
      <section className="section-y pb-0">
        <div className="container-site max-w-[880px]">
          <nav className="mb-7 flex gap-2 font-mono text-[12.5px] text-subtle" aria-label="Хлебные крошки">
            <Link href="/" className="hover:text-white">Главная</Link>
            <span aria-hidden>/</span>
            <Link href="/cases" className="hover:text-white">Кейсы</Link>
            <span aria-hidden>/</span>
            <span className="text-white">{c.niche}</span>
          </nav>
          <div className="flex flex-wrap gap-2.5">
            <span className="tag">{c.niche}</span>
            <span className="tag">{c.solutionName}</span>
            {c.nda && <span className="tag opacity-60">NDA</span>}
          </div>
          <h1 className="mt-6 text-[clamp(34px,4.4vw,48px)]">{c.title}</h1>
          <p className="grad-text mt-5 font-display text-[clamp(26px,3vw,34px)] font-bold">{c.metric}</p>
        </div>
      </section>

      <section className="section-y">
        <div className="container-site max-w-[880px] space-y-10">
          {[
            ["Контекст и задача", c.context],
            ["Что было сложно", c.challenge],
            ["Что мы сделали", c.approach],
          ].map(([t, body]) => (
            <div key={t}>
              <h2 className="font-display text-[24px] font-semibold">{t}</h2>
              <p className="mt-3 text-[16.5px] leading-relaxed text-subtle">{body}</p>
            </div>
          ))}

          <div>
            <h2 className="font-display text-[24px] font-semibold">Технологии</h2>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {c.tech.map((t) => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display text-[24px] font-semibold">Результаты</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {c.results.map((r) => (
                <div key={r.label} className="card-n">
                  <p className="text-sm text-subtle">{r.label}</p>
                  <p className="mt-2 font-mono text-[15px]">
                    <span className="text-subtle line-through">{r.before}</span>
                    <span aria-hidden> → </span>
                    <span className="text-cyanb-l">{r.after}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-y pt-0" id="lead">
        <div className="container-site grid max-w-[880px] items-center gap-10">
          <div className="card-n" data-glow="cyan">
            <h2 className="font-display text-[26px] font-semibold">Хочу так же</h2>
            <p className="mt-3 mb-7 text-subtle">
              Расскажите о задаче — предложим решение и оценку на основе похожих проектов.
            </p>
            <LeadForm presetSolution={c.solutionSlug} />
          </div>
        </div>
      </section>
    </>
  );
}

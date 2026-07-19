import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import LeadForm from "@/components/LeadForm";
import { getSolutionBySlug } from "@/lib/content-store";
import { solutions } from "@/data/solutions";
import JsonLd, { serviceLd, breadcrumbLd } from "@/components/JsonLd";

// Slug'и решений фиксированы (нужны для статической генерации),
// но контент читается из рантайм-хранилища — правки видны без пересборки.
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return solutions.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const s = getSolutionBySlug((await params).slug);
  if (!s) return {};
  return { title: s.name, description: s.sub };
}

export default async function SolutionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const s = getSolutionBySlug((await params).slug);
  if (!s) notFound();

  return (
    <>
      <JsonLd data={serviceLd(s.name, s.sub, s.slug)} />
      <JsonLd
        data={breadcrumbLd([
          { name: "Главная", path: "/" },
          { name: "Решения", path: "/solutions" },
          { name: s.name, path: `/solutions/${s.slug}` },
        ])}
      />

      {/* Hero решения */}
      <section
        className="relative overflow-hidden py-20"
        style={{
          background:
            "radial-gradient(800px 420px at 80% 20%, rgba(99,102,241,.20), transparent 65%), radial-gradient(500px 300px at 15% 85%, rgba(34,211,238,.08), transparent 60%)",
        }}
      >
        <div className="container-site">
          <nav className="mb-7 flex gap-2 font-mono text-[12.5px] text-subtle" aria-label="Хлебные крошки">
            <Link href="/" className="hover:text-white">Главная</Link>
            <span aria-hidden>/</span>
            <Link href="/solutions" className="hover:text-white">Решения</Link>
            <span aria-hidden>/</span>
            <span className="text-white">{s.name}</span>
          </nav>
          <span className="eyebrow">{s.eyebrow}</span>
          <h1 className="mt-5 max-w-[20ch] text-[clamp(38px,4.6vw,54px)]">{s.h1}</h1>
          <p className="mt-6 max-w-[48ch] text-[18px] text-subtle">{s.sub}</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link href="/contacts" className="btn btn-primary">Обсудить проект</Link>
            <a href="#lead" className="btn btn-secondary">Рассчитать стоимость</a>
          </div>
          <div className="mt-8 flex flex-wrap gap-2.5">
            {s.forWho.map((f) => (
              <span key={f} className="tag">{f}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Что это и зачем */}
      <section className="light section-y">
        <div className="container-site">
          <Reveal>
            <span className="eyebrow">Что это и зачем</span>
            <h2 className="mt-4 max-w-[26ch] text-[clamp(30px,4vw,40px)]">Что получает бизнес</h2>
          </Reveal>
          <div className="mt-11 grid gap-5 md:grid-cols-3">
            {s.benefits.map((b, i) => (
              <Reveal key={b.title} delay={i * 100}>
                <div className="card-n h-full">
                  <h3 className="text-[17px]">{b.title}</h3>
                  <p className="mt-2 text-[14.5px] text-mutedc">{b.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Что входит + стоимость */}
      <section className="light section-y pt-0">
        <div className="container-site grid gap-12 lg:grid-cols-2">
          <div>
            <span className="eyebrow">Что входит</span>
            <h2 className="mt-4 mb-8 text-[clamp(30px,4vw,40px)]">Состав решения</h2>
            <ul className="flex flex-col gap-3.5">
              {s.includes.map((item) => (
                <li key={item} className="flex items-start gap-3.5 text-[16px]">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-primary/35 bg-gradient-to-br from-cyanb/20 to-primary/20 text-xs text-primary-d" aria-hidden>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="card-n h-fit lg:sticky lg:top-24">
            <span className="eyebrow">Стоимость</span>
            <div className="grad-text mt-3 font-display text-[34px] font-bold">{s.price || "Рассчитывается индивидуально"}</div>
            <ul className="mt-4 mb-6 list-disc pl-5 text-[14.5px] text-mutedc">
              {s.priceNote.map((n) => (
                <li key={n} className="mb-1.5">{n}</li>
              ))}
            </ul>
            <a href="#lead" className="btn btn-primary w-full">Рассчитать для моей задачи</a>
          </div>
        </div>
      </section>

      {/* Этапы */}
      <section className="section-y">
        <div className="container-site">
          <Reveal>
            <span className="eyebrow">Этапы внедрения</span>
            <h2 className="mt-4 text-[clamp(30px,4vw,40px)]">Как проходит проект</h2>
          </Reveal>
          <div className="mt-11 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {s.steps.map((st, i) => (
              <Reveal key={st.title} delay={i * 100}>
                <div className="border-t-2 border-primary/35 pt-4">
                  <span className="font-mono text-xs text-primary-l">{st.n}</span>
                  <h3 className="mt-1.5 text-[16px]">{st.title}</h3>
                  <p className="mt-1.5 text-[13.5px] text-subtle">{st.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + форма */}
      <section className="section-y pt-0" id="lead">
        <div className="container-site grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-[clamp(30px,4vw,40px)]">Обсудить «{s.name}»</h2>
            <p className="mt-4 max-w-[44ch] text-subtle">
              Расскажите о задаче — за [48 часов] вернёмся с планом и оценкой. Решение уже выбрано в форме.
            </p>
          </div>
          <LeadForm presetSolution={s.slug} />
        </div>
      </section>
    </>
  );
}

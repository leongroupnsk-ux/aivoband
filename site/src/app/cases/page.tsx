import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { cases } from "@/data/cases";

export const metadata: Metadata = {
  title: "Кейсы внедрения ИИ с цифрами",
  description: "Реальные проекты Aivo: ассистенты поддержки, ИИ-продажники, RAG-системы. Метрики до и после.",
};

export default function CasesPage() {
  return (
    <section className="section-y">
      <div className="container-site">
        <span className="eyebrow">Кейсы</span>
        <h1 className="mt-5 max-w-[20ch] text-[clamp(38px,5vw,54px)]">Результаты, которые можно измерить</h1>
        <p className="mt-6 max-w-[50ch] text-[18px] text-subtle">
          Часть проектов под NDA — в таких кейсах называем нишу вместо бренда, цифры настоящие.
        </p>
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {cases.map((c, i) => (
            <Reveal key={c.slug} delay={i * 100}>
              <Link href={`/cases/${c.slug}`} className="card-n flex h-full flex-col gap-4" data-glow="cyan">
                <div className="flex flex-wrap gap-2.5">
                  <span className="tag">{c.niche}</span>
                  <span className="tag">{c.solutionName}</span>
                  {c.nda && <span className="tag opacity-60">NDA</span>}
                </div>
                <span className="grad-text font-display text-[26px] font-bold">{c.metric}</span>
                <p className="flex-1 text-[15px] text-subtle">{c.context}</p>
                <span className="font-mono text-[13px] text-primary-l">Читать кейс →</span>
              </Link>
            </Reveal>
          ))}
        </div>
        <p className="mt-10 font-mono text-[13px] text-subtle">
          [этап 6] Здесь появятся 2–3 кейса с реальными цифрами от заказчика + фильтр по типу решения и нише.
        </p>
      </div>
    </section>
  );
}

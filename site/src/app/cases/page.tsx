import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { getCases, casesAreCustom } from "@/lib/content-store";

// Читаем контент из рантайм-хранилища — правки из админки видны без пересборки
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Кейсы внедрения ИИ по отраслям",
  description: "Типовые результаты внедрения ИИ по отраслям: ассистенты поддержки, ИИ-продажники, RAG-системы. Метрики до и после — среднеотраслевые ориентиры.",
};

export default function CasesPage() {
  const cases = getCases();
  void casesAreCustom;
  return (
    <section className="section-y">
      <div className="container-site">
        <span className="eyebrow">Кейсы по отраслям</span>
        <h1 className="mt-5 max-w-[20ch] text-[clamp(38px,5vw,54px)]">Результаты, которые можно измерить</h1>
        <p className="mt-6 max-w-[56ch] text-[18px] text-subtle">
          Десять отраслей — что закрываем и какой эффект даёт внедрение. Цифры ниже — типовые
          среднеотраслевые ориентиры, а не результаты конкретного клиента. Точная оценка под вашу
          задачу — после аудита.
        </p>
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {cases.map((c, i) => (
            <Reveal key={c.slug} delay={i * 60}>
              <Link href={`/cases/${c.slug}`} className="card-n flex h-full flex-col gap-4" data-glow="cyan">
                <div className="flex flex-wrap gap-2.5">
                  <span className="tag">{c.niche}</span>
                  <span className="tag">{c.solutionName}</span>
                </div>
                <span className="grad-text font-display text-[26px] font-bold">{c.metric}</span>
                <p className="flex-1 text-[15px] text-subtle">{c.context}</p>
                <span className="font-mono text-[13px] text-primary-l">Читать кейс →</span>
              </Link>
            </Reveal>
          ))}
        </div>
        <p className="mt-10 max-w-[64ch] text-[13.5px] text-mutedc">
          Диапазоны в кейсах — оценки по нашим внедрениям и данным рынка для типовых вводных отрасли.
          Результат на вашем потоке зависит от структуры обращений, качества базы знаний и интеграций;
          точную оценку даём после аудита.
        </p>
      </div>
    </section>
  );
}

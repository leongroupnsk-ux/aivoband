import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { getAllScenarios } from "@/lib/scenarios";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Сценарии внедрения ИИ по отраслям",
  description:
    "Подробные разборы: как ИИ-ассистенты, RAG и ИИ-продажники внедряются в e-commerce, клиниках, онлайн-школах и других нишах. Архитектура, этапы, расчёт окупаемости.",
};

export default function ScenariosPage() {
  const scenarios = getAllScenarios();

  return (
    <section className="section-y">
      <div className="container-site">
        <span className="eyebrow">Сценарии внедрения</span>
        <h1 className="mt-5 max-w-[22ch] text-[clamp(38px,5vw,54px)]">Как это работает в вашей отрасли</h1>
        <p className="mt-6 max-w-[58ch] text-[18px] text-subtle">
          Разбираем по шагам: какую задачу закрываем, из чего собирается система, сколько занимает внедрение
          и как считать окупаемость. С архитектурой, таблицами и расчётами.
        </p>

        {/* Честная рамка жанра — это не клиентские кейсы */}
        <p className="mt-7 max-w-[62ch] rounded-[14px] border border-dashed border-primary-l/30 bg-primary/5 px-5 py-4 text-[14.5px] text-subtle">
          <b className="text-white">Это модельные разборы, а не кейсы клиентов.</b> Цифры в них — расчёты по типовым
          вводным отрасли с раскрытыми допущениями, а не достигнутые результаты конкретных проектов. Реальные кейсы
          с клиентскими метриками — в разделе{" "}
          <Link href="/cases" className="text-primary-l underline underline-offset-2">Кейсы</Link>.
        </p>

        {scenarios.length === 0 ? (
          <p className="mt-14 text-subtle">Сценарии скоро появятся.</p>
        ) : (
          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {scenarios.map((s, i) => (
              <Reveal key={s.slug} delay={i * 80}>
                <Link href={`/scenarios/${s.slug}`} className="card-n flex h-full flex-col gap-3.5" data-glow="indigo">
                  <div className="flex flex-wrap gap-2.5">
                    <span className="tag">{s.niche}</span>
                    {s.solutionName && <span className="tag">{s.solutionName}</span>}
                  </div>
                  <h2 className="font-display text-[21px] font-semibold leading-snug">{s.title}</h2>
                  <p className="flex-1 text-[15px] text-subtle">{s.tagline}</p>
                  <span className="font-mono text-[13px] text-primary-l">
                    Разбор · {s.readingMinutes} мин →
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

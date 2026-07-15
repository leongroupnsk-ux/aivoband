import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { solutions } from "@/data/solutions";

export const metadata: Metadata = {
  title: "Решения Aivo: 6 ИИ-продуктов для бизнеса",
  description:
    "RAG-системы, ассистенты поддержки, ИИ-продажники, консультанты, системы под ключ и мобильные приложения. Выберите под свою задачу.",
};

export default function SolutionsPage() {
  return (
    <section className="section-y">
      <div className="container-site">
        <span className="eyebrow">Решения</span>
        <h1 className="mt-5 max-w-[22ch] text-[clamp(38px,5vw,54px)]">Шесть продуктов под разные задачи</h1>
        <p className="mt-6 max-w-[54ch] text-[18px] text-subtle">
          Все решения работают на одном движке: поиск по вашим данным (RAG) + LLM + эскалация на человека. Разница — в сценарии, который они закрывают.
        </p>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {solutions.map((s, i) => (
            <Reveal key={s.slug} delay={i * 80}>
              <Link href={`/solutions/${s.slug}`} className="card-n flex h-full min-h-52 flex-col gap-4" data-glow={s.glow}>
                <span className="grid size-13 place-items-center rounded-full border border-primary-l/30 bg-gradient-to-br from-primary/20 to-magenta/15 text-[22px]" aria-hidden>
                  {s.icon}
                </span>
                <h2 className="font-display text-[20px] font-semibold">{s.name}</h2>
                <p className="flex-1 text-[15px] text-subtle">{s.short}</p>
                <span className="font-mono text-[13px] text-primary-l">Подробнее →</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

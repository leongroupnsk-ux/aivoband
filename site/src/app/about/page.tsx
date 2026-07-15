import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import Counter from "@/components/Counter";

export const metadata: Metadata = {
  title: "О компании",
  description:
    "Aivo — агентство внедрения ИИ. RAG-подход, передача кода в собственность, безопасность данных.",
};

export default function AboutPage() {
  return (
    <>
      <section className="section-y">
        <div className="container-site">
          <span className="eyebrow">О нас</span>
          <h1 className="mt-5 max-w-[18ch] text-[clamp(38px,5vw,54px)]">Делаем ИИ полезным, а не модным</h1>
          <p className="mt-6 max-w-[56ch] text-[18px] text-subtle">
            Aivo — команда инженеров и продуктологов, которая внедряет ИИ-системы там, где они окупаются: поддержка, продажи, консультации, работа с базой знаний. Наш слоган — «ИИ, который не выдумывает» — это архитектурный принцип, а не лозунг.
          </p>
          <div className="mt-14 grid gap-5 sm:grid-cols-3">
            {[
              { v: 0, suf: " проектов", d: "[реальная цифра от заказчика]" },
              { v: 0, suf: " лет опыта", d: "[реальная цифра от заказчика]" },
              { v: 100, suf: "%", d: "кода передаём в собственность клиента" },
            ].map((c) => (
              <div key={c.d} className="card-n">
                <Counter value={c.v} suffix={c.suf} className="grad-text font-display text-[34px] font-bold" />
                <p className="mt-2 text-sm text-subtle">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="light section-y">
        <div className="container-site">
          <Reveal>
            <span className="eyebrow">Принципы</span>
            <h2 className="mt-4 text-[clamp(30px,4vw,40px)]">На чём стоим</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {[
              ["Точность важнее эффектности", "RAG-подход: каждый ответ системы опирается на данные клиента и цитирует источник."],
              ["Код — собственность клиента", "Передаём репозиторий, документацию и права. Не строим бизнес на vendor lock-in."],
              ["Безопасность данных", "Деплой в инфраструктуру клиента, NDA, ключи только на сервере, никаких данных третьим лицам."],
              ["Честные границы", "Бот эскалирует сложное человеку, а мы говорим «эту задачу ИИ пока не решит» — до подписания договора, а не после."],
            ].map(([t, d]) => (
              <div key={t} className="card-n">
                <h3 className="text-[18px]">{t}</h3>
                <p className="mt-2.5 text-[15px] text-mutedc">{d}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/contacts" className="btn btn-primary">Обсудить проект</Link>
          </div>
        </div>
      </section>
    </>
  );
}

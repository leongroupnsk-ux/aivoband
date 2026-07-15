import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Как мы внедряем ИИ: 8 этапов от брифа до запуска",
  description:
    "Прозрачный процесс внедрения ИИ-системы: аудит данных, ТЗ, MVP, обучение на ваших данных, интеграции, запуск и поддержка.",
};

const STEPS = [
  { title: "Заявка и бриф", artifact: "зафиксированная задача и критерии успеха", term: "1–2 дня", text: "Разбираем задачу и цели: что болит, какой результат считаем успехом." },
  { title: "Аудит данных и сценариев", artifact: "отчёт: какие данные есть, чего не хватает", term: "2–4 дня", text: "Смотрим базу знаний, диалоги, регламенты — и честно говорим, чего не хватает для точных ответов." },
  { title: "ТЗ и архитектура", artifact: "документ с архитектурой и планом", term: "3–5 дней", text: "Фиксируем скоуп, стек, интеграции и план работ. Без сюрпризов в середине проекта." },
  { title: "Прототип / MVP", artifact: "работающий прототип на части данных", term: "1–3 недели", text: "Собираем ядро на готовых блоках — вы щупаете систему руками уже через пару недель." },
  { title: "Обучение на ваших данных (RAG)", artifact: "система отвечает по вашей базе", term: "1–2 недели", text: "Индексируем базу, настраиваем поиск и цитирование источников, калибруем качество." },
  { title: "Интеграции и тесты", artifact: "связка с CRM/сайтом/мессенджерами, отчёт о качестве", term: "1–2 недели", text: "Подключаем каналы и CRM, гоняем тесты на реальных сценариях." },
  { title: "Запуск", artifact: "продакшн + инструкции + код", term: "2–3 дня", text: "Выкатываем в прод, передаём код, документацию и инструкции команде." },
  { title: "Поддержка и дообучение", artifact: "ежемесячный отчёт качества ответов", term: "подписка", text: "Следим за качеством, дообучаем на новых данных, развиваем сценарии." },
];

export default function ProcessPage() {
  return (
    <>
      <section className="section-y">
        <div className="container-site">
          <span className="eyebrow">Как мы работаем</span>
          <h1 className="mt-5 max-w-[20ch] text-[clamp(38px,5vw,54px)]">Восемь этапов — от брифа до работающей системы</h1>
          <p className="mt-6 max-w-[54ch] text-[18px] text-subtle">
            Каждый этап заканчивается артефактом, который вы видите и принимаете. Никаких «мы что-то делаем, ждите».
          </p>

          <ol className="mt-16 border-l-2 border-primary-l/20 pl-8">
            {STEPS.map((s, i) => (
              <Reveal as="li" key={s.title} className="relative pb-12 last:pb-0" delay={i * 60}>
                <span
                  aria-hidden
                  className="absolute -left-[41px] top-1 size-4 rounded-full border-2 border-primary bg-ink"
                />
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h2 className="font-display text-[22px] font-semibold">{i + 1}. {s.title}</h2>
                  <span className="font-mono text-[12.5px] text-cyanb">{s.term}</span>
                </div>
                <p className="mt-2 max-w-[60ch] text-[15.5px] text-subtle">{s.text}</p>
                <p className="mt-2 font-mono text-[12.5px] text-primary-l">→ вы получаете: {s.artifact}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="light section-y">
        <div className="container-site">
          <Reveal>
            <span className="eyebrow">Что понадобится от вас</span>
            <h2 className="mt-4 text-[clamp(30px,4vw,40px)]">Три вещи — и мы стартуем</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              ["Доступы", "сайт, CRM, мессенджеры — по мере необходимости, не всё сразу"],
              ["База знаний", "документы, FAQ, регламенты — в любом виде, приведём в порядок сами"],
              ["Контактное лицо", "человек, который принимает этапы и отвечает на вопросы по продукту"],
            ].map(([t, d]) => (
              <div key={t} className="card-n">
                <h3 className="text-[17px]">{t}</h3>
                <p className="mt-2 text-[14.5px] text-mutedc">{d}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/contacts" className="btn btn-primary">Начать с брифа</Link>
          </div>
        </div>
      </section>
    </>
  );
}

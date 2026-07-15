import Link from "next/link";
import Reveal from "@/components/Reveal";
import Magnetic from "@/components/Magnetic";
import NeuroCanvas from "@/components/NeuroCanvas";
import TypeSwap from "@/components/TypeSwap";
import Pipeline from "@/components/Pipeline";
import Counter from "@/components/Counter";
import { solutions } from "@/data/solutions";
import JsonLd, { organizationLd, webSiteLd, faqLd } from "@/components/JsonLd";

const NICHES = ["E-COMMERCE", "ОНЛАЙН-ШКОЛЫ", "КЛИНИКИ", "SAAS-СЕРВИСЫ", "АГЕНТСТВА", "ФИНТЕХ"];

const FAQ = [
  { q: "Сколько это стоит?", a: "Зависит от решения и объёма данных. После бесплатного разбора задачи даём фиксированную оценку — без «часов» и сюрпризов." },
  { q: "Какие сроки?", a: "MVP — за [2–4 недели], полный запуск — [4–8 недель] в зависимости от объёма данных и интеграций." },
  { q: "Кому принадлежит код?", a: "Вам: передаём репозиторий, документацию и права. Система — ваша собственность, а не аренда." },
  { q: "Что с безопасностью данных?", a: "Данные не уходят третьим лицам, возможен деплой в вашу инфраструктуру, работаем под NDA." },
  { q: "Нужно ли нам своё ПО или серверы?", a: "Нет. Поможем выбрать: облако или ваша инфраструктура — по требованиям безопасности и бюджету." },
  { q: "А если бот ошибётся?", a: "RAG-подход: ответ опирается на вашу базу со ссылкой на источник. На сложном вопросе бот зовёт человека." },
  { q: "С чего начать?", a: "Оставьте заявку — за [48 часов] разберём задачу и предложим решение с оценкой." },
];

export default function Home() {
  return (
    <>
      <JsonLd data={organizationLd} />
      <JsonLd data={webSiteLd} />
      <JsonLd data={faqLd(FAQ)} />

      {/* 01 Hero */}
      <section className="relative flex min-h-[88vh] items-center overflow-hidden">
        <NeuroCanvas className="absolute inset-0 h-full w-full" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 500px at 18% 30%, rgba(99,102,241,.16), transparent 60%), radial-gradient(700px 460px at 85% 70%, rgba(236,72,153,.10), transparent 60%), linear-gradient(180deg, transparent 55%, #0d0a22)",
          }}
        />
        <div className="container-site relative z-10 py-24">
          <span className="eyebrow">ИИ, который не выдумывает</span>
          <h1 className="mt-6 max-w-[15ch] text-[clamp(44px,6vw,64px)] tracking-tight">
            Внедряем ИИ-
            <TypeSwap
              words={["ассистентов", "продажников", "консультантов", "RAG-системы"]}
              className="bg-gradient-to-r from-cyanb to-primary-l bg-clip-text text-transparent"
            />
            , которые отвечают точно
          </h1>
          <p className="mt-7 max-w-[52ch] text-[19px] text-subtle">
            Системы на ваших данных: RAG-подход исключает выдумки, работа 24/7 разгружает команду, а код мы передаём вам в собственность.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Magnetic><Link href="/contacts" className="btn btn-primary">Обсудить проект</Link></Magnetic>
            <Magnetic><Link href="/solutions" className="btn btn-secondary">Смотреть решения</Link></Magnetic>
          </div>
          <div className="mt-11 inline-flex items-center gap-2.5 rounded-full border border-primary-l/20 px-4 py-2 font-mono text-[13px] text-subtle">
            <span className="size-1.5 rounded-full bg-cyanb shadow-[0_0_12px_#22d3ee]" />
            [N] проектов · работаем на ваших данных
          </div>
        </div>
      </section>

      {/* 02 Логобар */}
      <div className="overflow-hidden border-y border-primary-l/10 py-6" aria-label="Нам доверяют">
        <div className="flex w-max animate-[marquee_30s_linear_infinite] gap-16 motion-reduce:animate-none">
          {[...NICHES, ...NICHES].map((n, i) => (
            <span key={i} className="whitespace-nowrap font-display text-[17px] font-semibold text-[#8a85c4]">
              {n}
            </span>
          ))}
        </div>
      </div>

      {/* 03 Проблема → решение */}
      <section className="section-y">
        <div className="container-site">
          <Reveal>
            <span className="eyebrow">Знакомо?</span>
            <h2 className="mt-4 max-w-[24ch] text-[clamp(30px,4vw,40px)]">Боли, с которыми к нам приходят</h2>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Поддержка съедает бюджет, а клиенты всё равно ждут",
              "Заявки ночью и в выходные остывают до утра",
              "Пробовали чат-бота — он выдумывал и злил клиентов",
              "Кажется, что ИИ — это дорого, долго и непонятно",
            ].map((pain, i) => (
              <Reveal key={pain} delay={i * 100}>
                <div className="card-n h-full text-[15px] text-subtle">«{pain}»</div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-6">
            <div className="grid gap-5 md:grid-cols-3">
              {[
                ["Отвечает по вашим данным", "RAG-подход: без фантазий, со ссылкой на источник."],
                ["Быстрый старт", "Готовые блоки вместо разработки с нуля — результат за [X] недель."],
                ["Прозрачно", "Фиксированные этапы, код в собственность, сложное — человеку."],
              ].map(([t, d]) => (
                <div key={t} className="card-n border-primary/40" data-glow="indigo">
                  <h3 className="text-[17px] text-primary-l">{t}</h3>
                  <p className="mt-2 text-sm text-subtle">{d}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* 04 Шесть продуктов */}
      <section className="section-y pt-0">
        <div className="container-site">
          <Reveal>
            <span className="eyebrow">Решения</span>
            <h2 className="mt-4 max-w-[28ch] text-[clamp(30px,4vw,40px)]">Шесть продуктов — под задачу, а не «ИИ ради ИИ»</h2>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {solutions.map((s, i) => (
              <Reveal key={s.slug} delay={i * 80}>
                <Link href={`/solutions/${s.slug}`} className="card-n flex h-full min-h-52 flex-col gap-4" data-glow={s.glow}>
                  <span className="grid size-13 place-items-center rounded-full border border-primary-l/30 bg-gradient-to-br from-primary/20 to-magenta/15 text-[22px]" aria-hidden>
                    {s.icon}
                  </span>
                  <h3 className="text-[20px]">{s.name}</h3>
                  <p className="flex-1 text-[15px] text-subtle">{s.short}</p>
                  <span className="font-mono text-[13px] text-primary-l">/solutions/{s.slug} →</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 05 Движок */}
      <section className="section-y pt-0">
        <div className="container-site">
          <Reveal>
            <span className="eyebrow">Как это работает</span>
            <h2 className="mt-4 text-[clamp(30px,4vw,40px)]">Один движок под всеми решениями</h2>
            <p className="mt-4 max-w-[56ch] text-subtle">
              Вопрос клиента проходит через поиск по вашей базе — модель отвечает по найденным фактам, а не по «фантазии». Не уверена — зовёт человека.
            </p>
          </Reveal>
          <Pipeline />
        </div>
      </section>

      {/* 06 Почему мы (светлая секция) */}
      <section className="light section-y">
        <div className="container-site">
          <Reveal>
            <span className="eyebrow">Почему Aivo</span>
            <h2 className="mt-4 text-[clamp(30px,4vw,40px)]">Четыре причины, по которым нас выбирают</h2>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { v: 99, suf: "%", t: "Точность на ваших данных", d: "RAG-подход: каждый ответ опирается на вашу базу знаний." },
              { v: 70, pre: "−", suf: "%", t: "Нагрузки на поддержку", d: "Типовые обращения бот закрывает сам. [заменить на реальную цифру]" },
              { v: 24, suf: "/7", t: "Без выходных", d: "Отвечает ночью, в праздники и в пиковые часы — за секунды." },
              { v: 100, suf: "%", t: "Код — ваш", d: "Передаём репозиторий, документацию и права. Система в собственность." },
            ].map((c, i) => (
              <Reveal key={c.t} delay={i * 100}>
                <div className="card-n h-full">
                  <Counter value={c.v} prefix={c.pre} suffix={c.suf} className="grad-text font-display text-[clamp(34px,4vw,46px)] font-bold" />
                  <h3 className="mt-1.5 text-[17px]">{c.t}</h3>
                  <p className="mt-2 text-sm text-mutedc">{c.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 08 Процесс кратко */}
      <section className="section-y">
        <div className="container-site">
          <Reveal>
            <span className="eyebrow">От заявки до запуска</span>
            <h2 className="mt-4 text-[clamp(30px,4vw,40px)]">Пять шагов — и система работает</h2>
          </Reveal>
          <Reveal className="mt-12">
            <ol className="flex flex-col justify-center gap-2 lg:flex-row lg:items-center lg:gap-0">
              {["Бриф", "Аудит данных", "MVP", "Запуск", "Поддержка"].map((s, i) => (
                <li key={s} className="contents">
                  {i > 0 && <span aria-hidden className="h-6 w-0.5 shrink-0 bg-primary-l/30 lg:h-0.5 lg:w-10" />}
                  <span className="rounded-xl border border-primary-l/20 px-6 py-3 text-center font-display text-[15px] text-subtle">
                    {s}
                  </span>
                </li>
              ))}
            </ol>
          </Reveal>
          <div className="mt-10 text-center">
            <Link href="/process" className="font-mono text-sm text-primary-l underline-offset-4 hover:underline">
              Подробнее о процессе →
            </Link>
          </div>
        </div>
      </section>

      {/* 10 FAQ */}
      <section className="light section-y">
        <div className="container-site max-w-[880px]">
          <Reveal>
            <span className="eyebrow">FAQ</span>
            <h2 className="mt-4 text-[clamp(30px,4vw,40px)]">Частые вопросы</h2>
          </Reveal>
          <div className="mt-10 flex flex-col gap-3">
            {FAQ.map((f) => (
              <details key={f.q} className="card-n group !p-0">
                <summary className="cursor-pointer list-none px-6 py-4 font-display text-[16.5px] font-semibold">
                  {f.q}
                  <span className="float-right text-primary transition-transform group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <p className="px-6 pb-5 text-[15.5px] text-mutedc">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 11 Финальный CTA */}
      <section className="section-y">
        <div className="container-site">
          <Reveal>
            <div
              className="rounded-3xl border border-primary-l/20 px-6 py-16 text-center md:py-24"
              style={{
                background:
                  "radial-gradient(600px 300px at 50% 0%, rgba(99,102,241,.25), transparent 70%), linear-gradient(180deg, rgba(30,26,74,.7), rgba(13,10,34,.9))",
              }}
            >
              <span className="eyebrow justify-center">Следующий шаг</span>
              <h2 className="mt-4 text-[clamp(30px,4vw,40px)]">Обсудим ваш проект?</h2>
              <p className="mx-auto mt-4 max-w-[46ch] text-subtle">
                Расскажите о задаче — за [48 часов] предложим решение, сроки и оценку. Бесплатно и без обязательств.
              </p>
              <Link href="/contacts" className="btn btn-primary mt-8">Оставить заявку</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

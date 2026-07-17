"use client";

import { useEffect, useRef, useState } from "react";

const NODES = [
  { t: "Клиент", d: "вопрос из любого канала" },
  { t: "Ядро", d: "маршрутизация и контекст" },
  { t: "Поиск · RAG", d: "факты из вашей базы" },
  { t: "LLM", d: "ответ по источникам" },
  { t: "Ответ", d: "точный, за секунды" },
];

/**
 * Схема движка (ТЗ §4.1 п.5, §6). Раньше был pin/scrub (GSAP) — секция залипала
 * и требовала длинной прокрутки. Заменено на самоиграющую анимацию: сигнал бежит
 * по узлам по кругу, скролл не захватывается. Пауза вне вьюпорта; reduced-motion —
 * статичная подсветка.
 */
export default function Pipeline() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActive(NODES.length - 1);
      return;
    }

    let inView = false;
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;

    const step = () => {
      setActive(i);
      if (i < NODES.length - 1) {
        i += 1;
        timer = setTimeout(step, 680);
      } else {
        // дошли до «Ответа» — пауза, затем цикл заново
        timer = setTimeout(() => {
          i = 0;
          step();
        }, 2200);
      }
    };

    const io = new IntersectionObserver(
      (es) => {
        const nowIn = es[0].isIntersecting;
        if (nowIn && !inView) {
          inView = true;
          i = 0;
          step();
        } else if (!nowIn && inView) {
          inView = false;
          clearTimeout(timer);
        }
      },
      { threshold: 0.4 }
    );
    io.observe(root);

    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={ref} className="mt-6">
      <div className="flex flex-col items-center justify-center gap-2 lg:flex-row lg:gap-0">
        {NODES.map((n, idx) => (
          <div key={n.t} className="contents">
            {idx > 0 && (
              <span
                aria-hidden
                className={`h-6 w-0.5 shrink-0 rounded-full transition-all duration-500 lg:h-0.5 lg:w-8 ${
                  active >= idx ? "bg-cyanb shadow-[0_0_8px_#22d3ee]" : "bg-primary-l/20"
                }`}
              />
            )}
            <div
              className={`rounded-[14px] border px-4 py-3 text-center transition-all duration-500 ${
                active === idx
                  ? "scale-105 border-cyanb bg-ink2/90 shadow-[0_0_40px_rgba(34,211,238,.32)]"
                  : active > idx
                    ? "border-primary-l/30 bg-ink2/60"
                    : "border-primary-l/15 bg-ink2/40"
              }`}
            >
              <div
                className={`whitespace-nowrap font-display text-[15px] font-semibold transition-colors duration-500 ${
                  active === idx ? "text-cyanb-l" : "text-white"
                }`}
              >
                {n.t}
              </div>
              <div className="whitespace-nowrap font-mono text-[10.5px] text-subtle">{n.d}</div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center font-mono text-[13px] text-subtle">
        сложный вопрос → <b className="font-medium text-magenta-l">эскалация на менеджера</b> — бот знает свои границы
      </p>
    </div>
  );
}

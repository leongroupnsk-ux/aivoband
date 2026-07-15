"use client";

import { useEffect, useRef } from "react";

const NODES = [
  { t: "Клиент", d: "вопрос из любого канала" },
  { t: "Ядро", d: "маршрутизация и контекст" },
  { t: "Поиск · RAG", d: "факты из вашей базы" },
  { t: "LLM", d: "ответ по источникам" },
  { t: "Ответ", d: "точный, за секунды" },
];

/**
 * Схема движка (ТЗ §4.1 п.5, §6): pin/scrub — при скролле секция «прилипает»,
 * узлы подсвечиваются последовательно, по линиям «бежит» импульс.
 * Fallback (reduced-motion / мобильные): простая последовательная подсветка.
 */
export default function Pipeline() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const nodes = [...root.querySelectorAll<HTMLElement>("[data-pnode]")];
    const links = [...root.querySelectorAll<HTMLElement>("[data-plink]")];
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktop = matchMedia("(min-width: 768px)").matches;

    // fallback: подсветка по IntersectionObserver без pin
    if (reduced || !desktop) {
      const io = new IntersectionObserver(
        (es) => {
          if (!es[0].isIntersecting) return;
          io.disconnect();
          nodes.forEach((n, i) =>
            setTimeout(() => {
              n.dataset.active = "true";
              if (i > 0) setTimeout(() => delete nodes[i - 1].dataset.active, 900);
            }, reduced ? 0 : i * 650)
          );
        },
        { threshold: 0.4 }
      );
      io.observe(root);
      return () => io.disconnect();
    }

    // pin/scrub через GSAP ScrollTrigger (динамический импорт — вне главного чанка).
    // Инициализация отложена: page-transition (template.tsx) держит transform
    // на предке ~450мс, и ScrollTrigger в этот момент выбрал бы pinType:"transform"
    // вместо position:fixed — пин ломается после конца анимации.
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;
    const initTimer = setTimeout(async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "center center",
          end: "+=1200",
          pin: true,
          scrub: 0.6,
        },
      });
      nodes.forEach((n, i) => {
        tl.to(n, {
          borderColor: "#22d3ee",
          boxShadow: "0 0 48px rgba(34,211,238,.28)",
          duration: 0.5,
        });
        tl.to(n.querySelector("[data-ptitle]"), { color: "#67e8f9", duration: 0.3 }, "<");
        if (links[i]) {
          // импульс по линии до следующего узла
          tl.fromTo(links[i], { backgroundPosition: "0% 0" }, { backgroundPosition: "100% 0", duration: 0.4 });
        }
        if (i < nodes.length - 1) {
          tl.to(n, { borderColor: "rgba(165,180,252,.22)", boxShadow: "none", duration: 0.4 }, "+=0.1");
          tl.to(n.querySelector("[data-ptitle]"), { color: "#fff", duration: 0.3 }, "<");
        }
      });
      }, root);
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(initTimer);
      ctx?.revert();
    };
  }, []);

  return (
    <div ref={ref} className="py-8">
      <div className="flex flex-col items-center justify-center gap-2 md:flex-row md:gap-0">
        {NODES.map((n, i) => (
          <div key={n.t} className="contents">
            {i > 0 && (
              <span
                aria-hidden
                data-plink
                className="h-6 w-0.5 shrink-0 md:h-0.5 md:w-6"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(165,180,252,.35) 0 45%, #22d3ee 50%, rgba(165,180,252,.35) 55% 100%) 0 0 / 300% 100%",
                }}
              />
            )}
            <div
              data-pnode
              className="rounded-[14px] border border-primary-l/20 bg-gradient-to-b from-ink2/80 to-ink2/40 px-4 py-3 text-center transition-colors duration-300 data-active:border-cyanb data-active:shadow-[0_0_48px_rgba(34,211,238,.28)]"
            >
              <div data-ptitle className="whitespace-nowrap font-display text-[15px] font-semibold in-data-active:text-cyanb-l">
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

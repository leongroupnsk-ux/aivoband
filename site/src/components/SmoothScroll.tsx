"use client";

import { useEffect } from "react";

/**
 * Инерционный скролл (ТЗ §6: Lenis) + синхронизация с GSAP ScrollTrigger.
 * Библиотеки грузятся динамически после гидрации — не попадают в главный
 * чанк и не увеличивают TBT (перформанс-бюджет ТЗ §10).
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    Promise.all([import("lenis"), import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ default: Lenis }, { default: gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);
        const lenis = new Lenis({ lerp: 0.12 });
        lenis.on("scroll", ScrollTrigger.update);
        const tick = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        // Пересчёт границ прокрутки. Lenis запоминает высоту страницы при старте,
        // а она успевает вырасти позже: дозагрузились шрифты, отрисовался сторонний
        // виджет, развернулась длинная статья. Со старой границей страница перестаёт
        // прокручиваться до конца — молча, будто «упёрлась». Поэтому пересчитываем
        // на загрузке, на готовности шрифтов и при любом изменении высоты body.
        const refresh = () => {
          lenis.resize();
          ScrollTrigger.refresh();
        };
        addEventListener("load", refresh);
        document.fonts?.ready.then(refresh).catch(() => {});

        let lastHeight = document.body.scrollHeight;
        const ro = new ResizeObserver(() => {
          const h = document.body.scrollHeight;
          if (Math.abs(h - lastHeight) > 4) {
            lastHeight = h;
            refresh();
          }
        });
        ro.observe(document.body);

        cleanup = () => {
          removeEventListener("load", refresh);
          ro.disconnect();
          gsap.ticker.remove(tick);
          lenis.destroy();
        };
      }
    );

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return null;
}

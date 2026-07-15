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
        cleanup = () => {
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

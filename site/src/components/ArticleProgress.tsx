"use client";

import { useEffect, useRef } from "react";

/** Прогресс-бар чтения статьи (ТЗ §4.5). */
export default function ArticleProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      el.style.width = h > 0 ? `${(scrollY / h) * 100}%` : "0%";
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-[3px]" aria-hidden>
      <div ref={ref} className="h-full w-0 bg-gradient-to-r from-primary to-magenta" />
    </div>
  );
}

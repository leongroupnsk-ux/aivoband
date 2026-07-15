"use client";

import { useEffect, useState } from "react";

/** Sticky-оглавление с подсветкой активного раздела (ТЗ §4.5). */
export default function Toc({ headings }: { headings: { id: string; text: string }[] }) {
  const [active, setActive] = useState(headings[0]?.id);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-15% 0px -70% 0px" }
    );
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [headings]);

  if (!headings.length) return null;

  return (
    <nav className="sticky top-24 hidden self-start text-sm lg:block" aria-label="Оглавление">
      <p className="mb-3.5 font-mono text-[11px] uppercase tracking-[0.12em] text-mutedc">Содержание</p>
      {headings.map((h) => (
        <a
          key={h.id}
          href={`#${h.id}`}
          className={`block border-l-2 py-1.5 pl-3.5 transition-colors ${
            active === h.id
              ? "border-primary font-semibold text-primary-d"
              : "border-line text-mutedc hover:text-body"
          }`}
        >
          {h.text}
        </a>
      ))}
    </nav>
  );
}

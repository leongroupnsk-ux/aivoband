"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Logo from "./Logo";
import { solutions } from "@/data/solutions";

const nav = [
  { href: "/process", label: "Как мы работаем" },
  { href: "/scenarios", label: "Сценарии" },
  { href: "/cases", label: "Кейсы" },
  { href: "/blog", label: "Блог" },
  { href: "/about", label: "О нас" },
];

export default function Header() {
  const [shrunk, setShrunk] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setShrunk(window.scrollY > 40);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  // закрываем меню при навигации
  useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
  }, [pathname]);

  // блокируем скролл под открытым мобильным меню
  useEffect(() => {
    document.documentElement.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className="sticky top-0 z-50 border-b border-primary-l/10 bg-ink/70 backdrop-blur-xl"
      onMouseLeave={() => setMegaOpen(false)}
    >
      <div
        className="container-site flex items-center gap-8 transition-all"
        style={{ paddingBlock: shrunk ? 10 : 18 }}
      >
        <Link href="/" className="flex items-center gap-2.5 font-display text-[22px] font-bold">
          <Logo size={shrunk ? 26 : 30} />
          Aivo
        </Link>

        <nav className="hidden items-center gap-7 text-[15px] text-subtle lg:flex" aria-label="Основная навигация">
          <button
            className="cursor-pointer transition-colors hover:text-white"
            aria-expanded={megaOpen}
            aria-haspopup="true"
            onClick={() => setMegaOpen((v) => !v)}
            onMouseEnter={() => setMegaOpen(true)}
          >
            Решения ▾
          </button>
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="transition-colors hover:text-white">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <Link href="/contacts" className="btn btn-primary btn-sm max-sm:hidden">
            Обсудить проект
          </Link>
          {/* бургер */}
          <button
            className="grid size-11 cursor-pointer place-items-center rounded-full border border-primary-l/25 lg:hidden"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span className="relative block h-3.5 w-5" aria-hidden>
              <span className={`absolute left-0 top-0 h-0.5 w-full bg-white transition-transform ${mobileOpen ? "top-1/2 -translate-y-1/2 rotate-45" : ""}`} />
              <span className={`absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-white transition-opacity ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`absolute bottom-0 left-0 h-0.5 w-full bg-white transition-transform ${mobileOpen ? "bottom-1/2 translate-y-1/2 -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>

      {/* мега-меню решений (десктоп) */}
      {megaOpen && (
        <div className="absolute inset-x-0 top-full hidden border-b border-primary-l/10 bg-ink/95 backdrop-blur-xl lg:block">
          <div className="container-site grid grid-cols-3 gap-4 py-8">
            {solutions.map((s) => (
              <Link
                key={s.slug}
                href={`/solutions/${s.slug}`}
                className="card-n !p-5"
                data-glow={s.glow}
                onClick={() => setMegaOpen(false)}
              >
                <div className="mb-2 flex items-center gap-3">
                  <span aria-hidden>{s.icon}</span>
                  <span className="font-display font-semibold">{s.name}</span>
                </div>
                <p className="text-sm text-subtle">{s.short}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* мобильное меню: портал в body — backdrop-filter шапки делает её
          containing block для fixed-элементов и схлопывает панель */}
      {mobileOpen && createPortal(
        <nav
          className="fixed inset-0 z-40 overflow-y-auto bg-ink/97 pt-20 lg:hidden"
          aria-label="Мобильная навигация"
        >
          <div className="container-site flex flex-col gap-1 py-6">
            <p className="mb-2 font-mono text-xs uppercase tracking-widest text-subtle">Решения</p>
            {solutions.map((s) => (
              <Link
                key={s.slug}
                href={`/solutions/${s.slug}`}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-[17px] transition-colors hover:bg-ink2/60"
              >
                <span aria-hidden>{s.icon}</span>
                {s.name}
              </Link>
            ))}
            <hr className="my-4 border-primary-l/15" />
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="rounded-xl px-3 py-3 text-[17px] transition-colors hover:bg-ink2/60"
              >
                {n.label}
              </Link>
            ))}
            <Link href="/contacts" className="btn btn-primary mt-6">
              Обсудить проект
            </Link>
          </div>
        </nav>,
        document.body
      )}
    </header>
  );
}

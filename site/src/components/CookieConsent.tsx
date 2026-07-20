"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getConsent, setConsent } from "@/lib/analytics";

/**
 * Баннер согласия на cookie/аналитику (ТЗ §9). До выбора аналитика не грузится.
 * Выбор хранится в localStorage; «Только необходимые» отключает счётчики.
 */
export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (getConsent() === null) setShow(true);
  }, []);

  if (!show) return null;

  function choose(value: "granted" | "denied") {
    setConsent(value);
    setShow(false);
  }

  return (
    <div
      role="dialog"
      aria-label="Согласие на использование cookie"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-3xl rounded-2xl border border-primary-l/20 bg-ink2/95 p-5 shadow-2xl backdrop-blur-md sm:inset-x-4 sm:bottom-4 sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <p className="flex-1 text-[14px] leading-relaxed text-subtle">
          Мы используем cookie и аналитику, чтобы улучшать сайт. Продолжая, вы соглашаетесь с обработкой данных —{" "}
          <Link href="/privacy" className="text-primary-l underline underline-offset-2">политика конфиденциальности</Link>.
        </p>
        <div className="flex shrink-0 gap-2.5">
          <button
            onClick={() => choose("denied")}
            className="rounded-full border border-primary-l/25 px-4 py-2 text-sm text-subtle transition-colors hover:text-white"
          >
            Только необходимые
          </button>
          <button onClick={() => choose("granted")} className="btn btn-primary !px-5 !py-2 text-sm">
            Принять
          </button>
        </div>
      </div>
    </div>
  );
}

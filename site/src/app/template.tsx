"use client";

import type { ReactNode } from "react";

/**
 * Page transition (ТЗ §6): fade + лёгкий сдвиг при каждой навигации.
 * template.tsx перемонтируется на каждый переход — анимация срабатывает сама,
 * без тяжёлых библиотек. Отключается при prefers-reduced-motion (см. globals.css).
 */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}

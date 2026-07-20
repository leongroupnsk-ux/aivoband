// Обёртка событий для Яндекс.Метрики и GA4. Работает, только если заданы
// NEXT_PUBLIC_YM_ID / NEXT_PUBLIC_GA_ID (иначе тихо ничего не делает).

declare global {
  interface Window {
    ym?: (id: number, action: string, ...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const YM_ID = process.env.NEXT_PUBLIC_YM_ID;
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/** Цель/событие: конверсии (отправка заявки, клики CTA). */
export function track(goal: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  if (YM_ID && window.ym) window.ym(Number(YM_ID), "reachGoal", goal, params);
  if (GA_ID && window.gtag) window.gtag("event", goal, params ?? {});
}

/** Просмотр страницы при SPA-навигации. */
export function pageview(url: string): void {
  if (typeof window === "undefined") return;
  if (YM_ID && window.ym) window.ym(Number(YM_ID), "hit", url);
  if (GA_ID && window.gtag) window.gtag("event", "page_view", { page_path: url });
}

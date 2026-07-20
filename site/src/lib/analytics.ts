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

export const CONSENT_KEY = "aivo-consent";
export const CONSENT_EVENT = "aivo-consent-change";

/** 'granted' | 'denied' | null (выбор ещё не сделан). */
export function getConsent(): "granted" | "denied" | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(CONSENT_KEY);
  return v === "granted" || v === "denied" ? v : null;
}

export function setConsent(value: "granted" | "denied"): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONSENT_KEY, value);
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}

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

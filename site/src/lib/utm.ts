/**
 * Источник заявки: UTM-метки кампании + страница входа и реферер.
 *
 * Метки снимаются при первом заходе и живут в sessionStorage (до закрытия вкладки),
 * чтобы дойти до формы, даже если человек сначала походил по сайту. Персональных
 * данных здесь нет — только откуда пришёл трафик; сохраняются они на сервере лишь
 * в момент, когда человек сам отправил заявку.
 */

const KEY = "aivo-utm";
const FIELDS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

export interface UtmData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  landing?: string;
  referrer?: string;
}

/** Вызывается один раз при загрузке сайта. Не перетирает метки первого захода. */
export function captureUtm(): void {
  if (typeof window === "undefined") return;
  if (sessionStorage.getItem(KEY)) return; // первый источник важнее последнего

  const params = new URLSearchParams(window.location.search);
  const data: UtmData = {};
  for (const f of FIELDS) {
    const v = params.get(f);
    if (v) data[f] = v.slice(0, 120);
  }

  const ref = document.referrer;
  const external = ref && !ref.startsWith(window.location.origin);
  if (Object.keys(data).length === 0 && !external) return; // прямой заход — нечего сохранять

  data.landing = window.location.pathname.slice(0, 120);
  if (external) data.referrer = ref.slice(0, 200);
  sessionStorage.setItem(KEY, JSON.stringify(data));
}

export function getUtm(): UtmData {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? "{}") as UtmData;
  } catch {
    return {};
  }
}

/** Короткая строка для админки: «yandex / cpc / autumn-sale». */
export function formatUtm(u: UtmData): string {
  const parts = [u.utm_source, u.utm_medium, u.utm_campaign].filter(Boolean);
  if (parts.length) return parts.join(" / ");
  if (u.referrer) {
    try {
      return `переход с ${new URL(u.referrer).hostname}`;
    } catch {
      return "переход по ссылке";
    }
  }
  return "";
}

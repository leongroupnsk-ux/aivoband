"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { YM_ID, GA_ID, pageview, track, getConsent, CONSENT_EVENT } from "@/lib/analytics";

/**
 * Счётчики Яндекс.Метрики и GA4. Рендерятся только при заданных ID
 * (NEXT_PUBLIC_YM_ID / NEXT_PUBLIC_GA_ID — вшиваются на этапе сборки).
 * Подключается на публичных страницах (не в админке).
 */
export default function Analytics() {
  const pathname = usePathname();
  const first = useRef(true);
  const [granted, setGranted] = useState(false);

  // согласие: читаем при монтировании и слушаем изменения (принял в баннере)
  useEffect(() => {
    const sync = () => setGranted(getConsent() === "granted");
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  useEffect(() => {
    // первый просмотр уже считают init/config — шлём hit только на переходах
    if (first.current) {
      first.current = false;
      return;
    }
    pageview(pathname + window.location.search);
  }, [pathname]);

  // Клики по главным CTA — одним делегированным слушателем, без правки каждой кнопки
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const el = (e.target as HTMLElement | null)?.closest?.("a.btn-primary, a.btn-secondary");
      if (!el) return;
      track("cta_click", {
        label: (el.textContent ?? "").trim().slice(0, 60),
        href: el.getAttribute("href") ?? "",
        page: window.location.pathname,
      });
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if ((!YM_ID && !GA_ID) || !granted) return null;

  return (
    <>
      {YM_ID && (
        <>
          <Script id="ym-init" strategy="afterInteractive">
            {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym(${Number(YM_ID)},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});`}
          </Script>
          <noscript>
            <div>
              <img src={`https://mc.yandex.ru/watch/${YM_ID}`} style={{ position: "absolute", left: "-9999px" }} alt="" />
            </div>
          </noscript>
        </>
      )}

      {GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
        </>
      )}
    </>
  );
}

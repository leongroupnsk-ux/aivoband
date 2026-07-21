"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import Header from "./Header";
import Footer from "./Footer";
import SmoothScroll from "./SmoothScroll";
import Analytics from "./Analytics";
import CookieConsent from "./CookieConsent";
import UtmCapture from "./UtmCapture";
import ThirdPartyInputFix from "./ThirdPartyInputFix";

/**
 * Публичный «хром» сайта (шапка, футер, плавный скролл, чат-виджет).
 * Скрывается на /admin — админка автономна, без навигации и чата сайта.
 */
function isAdmin(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function SiteChromeTop() {
  if (isAdmin(usePathname())) return null;
  return (
    <>
      <SmoothScroll />
      <UtmCapture />
      <Header />
    </>
  );
}

export function SiteChromeBottom() {
  if (isAdmin(usePathname())) return null;
  return (
    <>
      <Footer />
      <Analytics />
      <CookieConsent />
      <ThirdPartyInputFix />
      {/* Живой RAG-ассистент Aivo (наш продукт как демонстрация, ТЗ §9) */}
      <Script src="https://aivochat.ru/widget.js" data-key="pk_e5t_BWv_ihg3" strategy="afterInteractive" />
    </>
  );
}

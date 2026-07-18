import type { Metadata } from "next";
import { Outfit, Instrument_Sans, Geist_Mono } from "next/font/google";
import { SiteChromeTop, SiteChromeBottom } from "@/components/SiteChrome";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin", "latin-ext"],
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aivo.example";

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "Внедрение ИИ для бизнеса: ассистенты, RAG, боты под ключ — Aivo",
    template: "%s — Aivo",
  },
  description:
    "Внедряем ИИ-системы на ваших данных: ассистенты поддержки, ИИ-продажники, RAG. Отвечают точно, работают 24/7, код передаём вам.",
  alternates: { canonical: "./" },
  openGraph: {
    siteName: "Aivo",
    locale: "ru_RU",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ru"
      className={`${outfit.variable} ${instrument.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SiteChromeTop />
        <main className="flex-1">{children}</main>
        <SiteChromeBottom />
      </body>
    </html>
  );
}

import type { Metadata } from "next";

// Админка не должна индексироваться и не наследует публичный layout сайта.
export const metadata: Metadata = {
  title: "Админка — Aivo",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-ink text-white">{children}</div>;
}

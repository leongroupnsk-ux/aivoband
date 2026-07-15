"use client";

import { useState } from "react";

/** Шеринг статьи + копирование ссылки (ТЗ §4.5). */
export default function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard недоступен — молча пропускаем */
    }
  }

  function shareTg() {
    const url = `https://t.me/share/url?url=${encodeURIComponent(location.href)}&text=${encodeURIComponent(title)}`;
    window.open(url, "_blank", "noopener");
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button onClick={shareTg} className="tag cursor-pointer transition-colors hover:border-primary">
        Поделиться в Telegram
      </button>
      <button onClick={copy} className="tag cursor-pointer transition-colors hover:border-primary" aria-live="polite">
        {copied ? "Скопировано ✓" : "Копировать ссылку"}
      </button>
    </div>
  );
}

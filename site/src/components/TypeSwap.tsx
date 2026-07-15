"use client";

import { useEffect, useState } from "react";

/**
 * Смена слов в hero (ТЗ §6: «ассистент / продажник / консультант»).
 * Появление — CSS-анимацией при ремоунте (key): слово никогда не остаётся
 * скрытым, даже если таймеры/кадры троттлятся в фоновой вкладке.
 */
export default function TypeSwap({ words, className = "" }: { words: string[]; className?: string }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((v) => (v + 1) % words.length), 3200);
    return () => clearInterval(id);
  }, [words.length]);

  return (
    <span key={i} className={`word-in inline-block ${className}`}>
      {words[i]}
    </span>
  );
}

"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "done";

/**
 * Плавающий чат-виджет (ТЗ §3, §9). Пока RAG-ассистент Aivo не подключён —
 * работает fallback из контент-матрицы: мини-форма «задать вопрос» → /api/lead.
 * Подключение живого ассистента — отдельный релиз (см. README, риск №3).
 */
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    if (!data.question?.trim() || !data.contact?.trim()) return;
    setStatus("loading");
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Вопрос из чата",
          contact: data.contact,
          message: data.question,
          source: "chat-widget",
        }),
      });
    } finally {
      setStatus("done");
    }
  }

  return (
    <>
      {/* панель */}
      {open && (
        <div
          className="fixed bottom-24 right-5 z-[70] w-[min(360px,calc(100vw-40px))] rounded-2xl border border-primary-l/25 bg-ink2/95 p-5 shadow-2xl backdrop-blur-xl"
          role="dialog"
          aria-label="Чат с Aivo"
        >
          <div className="mb-4 flex items-center gap-3">
            <span aria-hidden className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-primary to-magenta text-sm font-bold text-white">A</span>
            <div>
              <p className="font-display text-[15px] font-semibold text-white">Ассистент Aivo</p>
              <p className="font-mono text-[11px] text-subtle">отвечаем в течение [N] часов</p>
            </div>
          </div>

          {status === "done" ? (
            <p className="text-[14.5px] text-subtle" role="status">
              Спасибо! Передали вопрос команде — ответим на оставленный контакт.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-3">
              <p className="text-[13.5px] text-subtle">
                Привет! Я ассистент Aivo. Задайте вопрос о решениях, ценах или сроках — команда ответит на ваш контакт.
              </p>
              <textarea className="field min-h-20 !text-sm" name="question" placeholder="Ваш вопрос" required />
              <input className="field !text-sm" name="contact" placeholder="Telegram / телефон / email" required />
              <button type="submit" className="btn btn-primary btn-sm" disabled={status === "loading"}>
                {status === "loading" ? "Отправляем…" : "Задать вопрос"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* плавающая кнопка */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Закрыть чат" : "Открыть чат"}
        className="fixed bottom-5 right-5 z-[70] grid size-14 cursor-pointer place-items-center rounded-full bg-gradient-to-br from-primary to-magenta text-xl text-white shadow-[0_8px_28px_rgba(120,80,220,.45)] transition-transform hover:scale-105"
      >
        {open ? "✕" : "💬"}
      </button>
    </>
  );
}

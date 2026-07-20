"use client";

import Link from "next/link";
import { useState } from "react";
import { solutions } from "@/data/solutions";
import { track } from "@/lib/analytics";

type Status = "idle" | "loading" | "done" | "error";

/** Форма заявки (ТЗ §4.7): имя, контакт, select решения, сообщение, согласие ПД, honeypot. */
export default function LeadForm({ presetSolution }: { presetSolution?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    const errs: Record<string, string> = {};
    if (!data.name?.trim()) errs.name = "Как к вам обращаться?";
    if (!data.contact?.trim()) errs.contact = "Оставьте Telegram, телефон или email";
    if (!data.consent) errs.consent = "Нужно согласие на обработку данных";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        track("lead_submit", { solution: data.solution || "не указано", source: data.source || "form" });
      }
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="card-n text-center" role="status">
        <h3 className="text-xl">Спасибо! Заявка у нас</h3>
        <p className="mt-3 text-subtle">
          Ответим в течение [N] часов. А пока — загляните в{" "}
          <Link href="/blog" className="text-primary-l underline underline-offset-4">блог</Link> или{" "}
          <Link href="/cases" className="text-primary-l underline underline-offset-4">кейсы</Link>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {/* honeypot от спама */}
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div>
        <input className="field" name="name" placeholder="Имя *" aria-invalid={!!errors.name} aria-describedby={errors.name ? "err-name" : undefined} />
        {errors.name && <p id="err-name" className="mt-1.5 text-sm text-error">{errors.name}</p>}
      </div>
      <div>
        <input className="field" name="contact" placeholder="Telegram / телефон / email *" aria-invalid={!!errors.contact} aria-describedby={errors.contact ? "err-contact" : undefined} />
        {errors.contact && <p id="err-contact" className="mt-1.5 text-sm text-error">{errors.contact}</p>}
      </div>
      <select className="field" name="solution" defaultValue={presetSolution ?? ""} aria-label="Что нужно">
        <option value="">Что нужно — не знаю / другое</option>
        {solutions.map((s) => (
          <option key={s.slug} value={s.slug}>{s.name}</option>
        ))}
      </select>
      <textarea className="field min-h-28" name="message" placeholder="Пара слов о задаче" />

      <label className="flex items-start gap-3 text-sm text-subtle">
        <input type="checkbox" name="consent" className="mt-1 size-4 accent-indigo-500" aria-invalid={!!errors.consent} />
        <span>
          Согласен на обработку персональных данных —{" "}
          <Link href="/privacy" className="underline underline-offset-2">политика</Link>
        </span>
      </label>
      {errors.consent && <p className="text-sm text-error">{errors.consent}</p>}
      {status === "error" && (
        <p className="text-sm text-error" role="alert">
          Не получилось отправить. Попробуйте ещё раз или напишите в Telegram.
        </p>
      )}

      <button type="submit" className="btn btn-primary" disabled={status === "loading"}>
        {status === "loading" ? "Отправляем…" : "Отправить заявку"}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import type { CaseStudy, Solution } from "@/lib/content-store";

type Kind = "cases" | "solutions";
type Item = { key: string; text: string };

function toItems(arr: unknown[]): Item[] {
  return arr.map((o, i) => ({ key: `${i}-${Math.random().toString(36).slice(2, 7)}`, text: JSON.stringify(o, null, 2) }));
}

const BLANK_CASE: CaseStudy = {
  slug: "novyj-kejs",
  niche: "Ниша",
  solutionSlug: "assistant",
  solutionName: "Умные ассистенты",
  metric: "+X% результата",
  title: "Заголовок кейса",
  context: "Контекст и задача.",
  challenge: "Что было сложно.",
  approach: "Что мы сделали.",
  tech: ["RAG", "LLM API"],
  results: [{ label: "Метрика", before: "было", after: "стало" }],
  nda: false,
};

export default function ContentEditor({
  initialCases,
  initialSolutions,
}: {
  initialCases: CaseStudy[];
  initialSolutions: Solution[];
}) {
  const [tab, setTab] = useState<Kind>("cases");
  const [cases, setCases] = useState<Item[]>(() => toItems(initialCases));
  const [solutions, setSolutions] = useState<Item[]>(() => toItems(initialSolutions));
  const [status, setStatus] = useState<{ kind: Kind; msg: string; ok: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  const items = tab === "cases" ? cases : solutions;
  const setItems = tab === "cases" ? setCases : setSolutions;

  function updateItem(key: string, text: string) {
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, text } : it)));
  }
  function removeItem(key: string) {
    setItems((prev) => prev.filter((it) => it.key !== key));
  }
  function addCase() {
    setCases((prev) => [...prev, ...toItems([BLANK_CASE])]);
  }

  async function save() {
    setBusy(true);
    setStatus(null);
    // парсим каждый элемент
    const parsed: unknown[] = [];
    for (const [i, it] of items.entries()) {
      try {
        parsed.push(JSON.parse(it.text));
      } catch {
        setStatus({ kind: tab, ok: false, msg: `Элемент #${i + 1}: невалидный JSON` });
        setBusy(false);
        return;
      }
    }
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: tab, data: parsed }),
      });
      const json = await res.json();
      if (res.ok) setStatus({ kind: tab, ok: true, msg: "Сохранено ✓ Правки уже на сайте." });
      else setStatus({ kind: tab, ok: false, msg: json.error ?? "Ошибка сохранения" });
    } catch {
      setStatus({ kind: tab, ok: false, msg: "Ошибка сети" });
    } finally {
      setBusy(false);
    }
  }

  async function reset() {
    if (!confirm(`Вернуть ${tab === "cases" ? "кейсы" : "решения"} к исходным? Ваши правки будут потеряны.`)) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: tab, action: "reset" }),
      });
      const json = await res.json();
      if (res.ok) {
        setItems(toItems(json.data));
        setStatus({ kind: tab, ok: true, msg: "Сброшено к исходным значениям." });
      } else setStatus({ kind: tab, ok: false, msg: json.error ?? "Ошибка" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {(["cases", "solutions"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              tab === k ? "border-primary text-primary-l" : "border-primary-l/20 text-subtle hover:text-white"
            }`}
          >
            {k === "cases" ? `Кейсы (${cases.length})` : `Решения (${solutions.length})`}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          {tab === "cases" && (
            <button onClick={addCase} disabled={busy} className="rounded-lg border border-cyanb/40 px-3.5 py-1.5 text-sm text-cyanb-l hover:bg-cyanb/10">
              + Кейс
            </button>
          )}
          <button onClick={reset} disabled={busy} className="rounded-lg border border-primary-l/25 px-3.5 py-1.5 text-sm text-subtle hover:text-white">
            Сбросить
          </button>
          <button onClick={save} disabled={busy} className="btn btn-primary !px-5 !py-1.5 text-sm">
            {busy ? "Сохраняю…" : "Сохранить"}
          </button>
        </div>
      </div>

      <p className="mb-4 text-[13px] text-subtle">
        Каждый блок — один {tab === "cases" ? "кейс" : "решение"} в формате JSON. Правьте значения в кавычках
        (замените плейсхолдеры вида <code className="text-cyanb-l">[X]</code>). У решений можно менять только контент —
        набор из 6 менять нельзя. После «Сохранить» правки сразу на сайте.
      </p>

      {status && status.kind === tab && (
        <p className={`mb-4 rounded-lg border px-4 py-2.5 text-sm ${status.ok ? "border-cyanb/40 bg-cyanb/10 text-cyanb-l" : "border-error/40 bg-error/10 text-error"}`}>
          {status.msg}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {items.map((it, i) => {
          let label = `#${i + 1}`;
          try {
            const o = JSON.parse(it.text);
            label = o.title || o.name || o.slug || label;
          } catch {
            label = `#${i + 1} · ошибка JSON`;
          }
          return (
            <details key={it.key} className="rounded-xl border border-primary-l/15 bg-ink2/40">
              <summary className="cursor-pointer list-none px-4 py-3 text-[15px] font-medium">
                <span className="font-mono text-xs text-subtle">{i + 1}.</span> {label}
              </summary>
              <div className="border-t border-primary-l/10 p-4">
                <textarea
                  spellCheck={false}
                  value={it.text}
                  onChange={(e) => updateItem(it.key, e.target.value)}
                  rows={Math.min(28, it.text.split("\n").length + 1)}
                  className="w-full resize-y rounded-lg border border-primary-l/20 bg-ink px-3 py-2.5 font-mono text-[13px] leading-relaxed text-white/90 focus:border-primary focus:outline-none"
                />
                {tab === "cases" && (
                  <button onClick={() => removeItem(it.key)} className="mt-2 text-xs text-error/80 hover:text-error">
                    Удалить кейс
                  </button>
                )}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import type { CaseStudy, Solution } from "@/lib/content-store";
import CaseFields from "./CaseFields";

type Kind = "cases" | "solutions";
type JsonItem = { key: string; text: string };
type SolutionOpt = { slug: string; name: string };

function toJsonItems(arr: unknown[]): JsonItem[] {
  return arr.map((o, i) => ({ key: `${i}-${Math.random().toString(36).slice(2, 7)}`, text: JSON.stringify(o, null, 2) }));
}

const blankCase = (solutions: SolutionOpt[]): CaseStudy => ({
  slug: "",
  niche: "",
  solutionSlug: solutions[0]?.slug ?? "assistant",
  solutionName: solutions[0]?.name ?? "",
  metric: "",
  title: "",
  context: "",
  challenge: "",
  approach: "",
  tech: [],
  results: [{ label: "", before: "", after: "" }],
  nda: false,
});

export default function ContentEditor({
  initialCases,
  initialSolutions,
  solutionOptions,
}: {
  initialCases: CaseStudy[];
  initialSolutions: Solution[];
  solutionOptions: SolutionOpt[];
}) {
  const [tab, setTab] = useState<Kind>("cases");
  const [cases, setCases] = useState<CaseStudy[]>(initialCases);
  const [solutions, setSolutions] = useState<JsonItem[]>(() => toJsonItems(initialSolutions));
  const [status, setStatus] = useState<{ kind: Kind; msg: string; ok: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  function patchCase(i: number, patch: Partial<CaseStudy>) {
    setCases((prev) => prev.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  }

  async function save() {
    setBusy(true);
    setStatus(null);

    let data: unknown;
    if (tab === "cases") {
      data = cases;
    } else {
      const parsed: unknown[] = [];
      for (const [i, it] of solutions.entries()) {
        try {
          parsed.push(JSON.parse(it.text));
        } catch {
          setStatus({ kind: tab, ok: false, msg: `Решение #${i + 1}: невалидный JSON` });
          setBusy(false);
          return;
        }
      }
      data = parsed;
    }

    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: tab, data }),
      });
      const json = await res.json();
      setStatus(
        res.ok
          ? { kind: tab, ok: true, msg: "Сохранено ✓ Правки уже на сайте." }
          : { kind: tab, ok: false, msg: json.error ?? "Ошибка сохранения" },
      );
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
        if (tab === "cases") setCases(json.data as CaseStudy[]);
        else setSolutions(toJsonItems(json.data as unknown[]));
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
            <button
              onClick={() => setCases((p) => [...p, blankCase(solutionOptions)])}
              disabled={busy}
              className="rounded-lg border border-cyanb/40 px-3.5 py-1.5 text-sm text-cyanb-l hover:bg-cyanb/10"
            >
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

      {status && status.kind === tab && (
        <p className={`mb-4 rounded-lg border px-4 py-2.5 text-sm ${status.ok ? "border-cyanb/40 bg-cyanb/10 text-cyanb-l" : "border-error/40 bg-error/10 text-error"}`}>
          {status.msg}
        </p>
      )}

      {tab === "cases" ? (
        <>
          <p className="mb-4 text-[13px] text-subtle">
            Заполните поля обычным текстом. Slug — адрес страницы кейса, только латиница и дефисы.
            После «Сохранить» правки сразу на сайте.
          </p>
          {cases.length === 0 ? (
            <p className="rounded-xl border border-primary-l/15 bg-ink2/40 px-6 py-10 text-center text-subtle">
              Кейсов нет. Нажмите «+ Кейс», чтобы добавить первый.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {cases.map((c, i) => (
                <details key={i} className="rounded-xl border border-primary-l/15 bg-ink2/40" open={cases.length === 1}>
                  <summary className="cursor-pointer list-none px-4 py-3 text-[15px] font-medium">
                    <span className="font-mono text-xs text-subtle">{i + 1}.</span> {c.title || "(без заголовка)"}
                    {c.metric && <span className="ml-2 text-[13px] text-cyanb-l">{c.metric}</span>}
                  </summary>
                  <div className="border-t border-primary-l/10 p-4">
                    <CaseFields
                      value={c}
                      solutions={solutionOptions}
                      onChange={(patch) => patchCase(i, patch)}
                      onRemove={() => setCases((p) => p.filter((_, j) => j !== i))}
                    />
                  </div>
                </details>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <p className="mb-4 text-[13px] text-subtle">
            Решения правятся в формате JSON: структура сложная (выгоды, состав, этапы), а набор из 6 менять нельзя.
            Правьте текст в кавычках — например, замените плейсхолдеры вида <code className="text-cyanb-l">[X]</code>.
          </p>
          <div className="flex flex-col gap-3">
            {solutions.map((it, i) => {
              let label = `#${i + 1}`;
              try {
                label = JSON.parse(it.text).name || label;
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
                      onChange={(e) => setSolutions((prev) => prev.map((x) => (x.key === it.key ? { ...x, text: e.target.value } : x)))}
                      rows={Math.min(28, it.text.split("\n").length + 1)}
                      className="w-full resize-y rounded-lg border border-primary-l/20 bg-ink px-3 py-2.5 font-mono text-[13px] leading-relaxed text-white/90 focus:border-primary focus:outline-none"
                    />
                  </div>
                </details>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

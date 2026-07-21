"use client";

import { useState } from "react";
import type { StoredScenario } from "@/lib/scenarios";

type SolutionOpt = { slug: string; name: string };

const HINT = `## Заголовок раздела

Текст. Поддерживается **Markdown** и таблицы.

<StatGrid items='[{"value":"50%","label":"описание"},{"value":"24/7","label":"описание"}]' />

<BarCompare data='[{"label":"Метрика","before":30,"after":5}]' unit="мин" betterIs="less" caption="Пояснение." />

<Timeline items='[{"when":"1 неделя","title":"Этап","text":"Описание."}]' />

<ModelNote assumptions='["допущение раз","допущение два"]'>
Пояснение к расчёту.
</ModelNote>
`;

const empty = (): StoredScenario => ({
  slug: "",
  niche: "",
  title: "",
  tagline: "",
  solution: undefined,
  order: 99,
  readingMinutes: 0,
  body: HINT,
});

export default function ScenarioEditor({
  initial,
  solutions,
  fileScenarios,
}: {
  initial: StoredScenario[];
  solutions: SolutionOpt[];
  fileScenarios: { slug: string; title: string; niche: string }[];
}) {
  const [items, setItems] = useState<StoredScenario[]>(initial);
  const [editing, setEditing] = useState<(StoredScenario & { originalSlug?: string }) | null>(null);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!editing) return;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/scenarios", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      const json = await res.json();
      if (!res.ok) {
        setStatus({ ok: false, msg: json.error ?? "Ошибка сохранения" });
        return;
      }
      const saved = { ...editing, slug: json.slug };
      setItems((prev) => [saved, ...prev.filter((p) => p.slug !== editing.originalSlug && p.slug !== json.slug)]);
      setStatus({ ok: true, msg: "Сохранено ✓ Разбор уже на сайте." });
      setEditing(null);
    } catch {
      setStatus({ ok: false, msg: "Ошибка сети" });
    } finally {
      setBusy(false);
    }
  }

  async function remove(slug: string) {
    if (!confirm("Удалить разбор безвозвратно?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/scenarios?slug=${encodeURIComponent(slug)}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((p) => p.slug !== slug));
        setStatus({ ok: true, msg: "Разбор удалён." });
      }
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    const set = (patch: Partial<StoredScenario>) => setEditing((e) => (e ? { ...e, ...patch } : e));
    return (
      <div>
        {status && !status.ok && (
          <p className="mb-4 rounded-lg border border-error/40 bg-error/10 px-4 py-2.5 text-sm text-error">{status.msg}</p>
        )}
        <div className="flex flex-col gap-4">
          <label className="block">
            <span className="mb-1 block text-sm text-subtle">Заголовок *</span>
            <input className="field" value={editing.title} onChange={(e) => set({ title: e.target.value })} placeholder="ИИ-консультант для клиники" />
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-sm text-subtle">Отрасль</span>
              <input className="field" value={editing.niche} onChange={(e) => set({ niche: e.target.value })} placeholder="Клиники" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-subtle">Slug (URL)</span>
              <input className="field font-mono text-sm" value={editing.slug} onChange={(e) => set({ slug: e.target.value })} placeholder="из заголовка" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-subtle">Порядок в списке</span>
              <input type="number" className="field" value={editing.order ?? 99} onChange={(e) => set({ order: Number(e.target.value) })} />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm text-subtle">Подзаголовок — какую боль закрывает</span>
            <textarea className="field min-h-20" value={editing.tagline} onChange={(e) => set({ tagline: e.target.value })} />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-subtle">Решение (CTA в разборе)</span>
            <select className="field" value={editing.solution ?? ""} onChange={(e) => set({ solution: e.target.value || undefined })}>
              <option value="">— нет —</option>
              {solutions.map((s) => (
                <option key={s.slug} value={s.slug}>{s.name}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-subtle">
              Текст разбора (Markdown). Данные компонентов — <b>JSON-строкой в одинарных кавычках</b>, выражения
              вида <code className="text-cyanb-l">{"{[...]}"}</code> не работают.
            </span>
            <textarea
              spellCheck={false}
              className="field min-h-[420px] font-mono text-[13px] leading-relaxed"
              value={editing.body}
              onChange={(e) => set({ body: e.target.value })}
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <button onClick={save} disabled={busy} className="btn btn-primary !px-6 !py-2 text-sm">
              {busy ? "Сохраняю…" : "Сохранить"}
            </button>
            <button onClick={() => { setEditing(null); setStatus(null); }} disabled={busy} className="rounded-lg border border-primary-l/25 px-4 py-2 text-sm text-subtle hover:text-white">
              Отмена
            </button>
            {editing.originalSlug && (
              <a href={`/scenarios/${editing.slug || editing.originalSlug}`} target="_blank" rel="noreferrer" className="ml-auto text-sm text-primary-l hover:underline">
                Открыть на сайте ↗
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-subtle">Разборов из админки: {items.length}</p>
        <button onClick={() => { setStatus(null); setEditing(empty()); }} className="btn btn-primary !px-5 !py-1.5 text-sm">
          + Новый разбор
        </button>
      </div>

      {status && (
        <p className={`mb-4 rounded-lg border px-4 py-2.5 text-sm ${status.ok ? "border-cyanb/40 bg-cyanb/10 text-cyanb-l" : "border-error/40 bg-error/10 text-error"}`}>
          {status.msg}
        </p>
      )}

      {items.length > 0 && (
        <div className="mb-8 flex flex-col gap-3">
          {items.map((p) => (
            <div key={p.slug} className="flex flex-wrap items-center gap-3 rounded-xl border border-primary-l/15 bg-ink2/40 p-4">
              <div className="min-w-0 flex-1">
                <span className="font-display text-[16px] font-medium">{p.title || "(без заголовка)"}</span>
                <p className="mt-0.5 font-mono text-xs text-subtle">{p.niche} · /scenarios/{p.slug}</p>
              </div>
              <button onClick={() => { setStatus(null); setEditing({ ...p, originalSlug: p.slug }); }} className="rounded-lg border border-primary/40 px-3.5 py-1.5 text-sm text-primary-l hover:bg-primary/10">
                Править
              </button>
              <button onClick={() => remove(p.slug)} disabled={busy} className="rounded-lg border border-error/30 px-3.5 py-1.5 text-sm text-error/80 hover:bg-error/10">
                Удалить
              </button>
            </div>
          ))}
        </div>
      )}

      {fileScenarios.length > 0 && (
        <>
          <p className="mb-3 text-sm text-subtle">Разборы из репозитория (правятся в коде):</p>
          <div className="flex flex-col gap-2">
            {fileScenarios.map((f) => (
              <div key={f.slug} className="flex items-center gap-3 rounded-xl border border-primary-l/10 bg-ink2/20 px-4 py-3">
                <span className="min-w-0 flex-1 text-[15px] text-subtle">{f.title}</span>
                <span className="font-mono text-xs text-subtle/70">{f.niche}</span>
                <a href={`/scenarios/${f.slug}`} target="_blank" rel="noreferrer" className="text-sm text-primary-l hover:underline">
                  ↗
                </a>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import type { CaseStudy } from "@/lib/content-store";

type SolutionOpt = { slug: string; name: string };

/**
 * Пер-полевая форма кейса — вместо правки сырого JSON.
 * Заказчик правит контент, не рискуя сломать структуру.
 */
export default function CaseFields({
  value,
  solutions,
  onChange,
  onRemove,
}: {
  value: CaseStudy;
  solutions: SolutionOpt[];
  onChange: (patch: Partial<CaseStudy>) => void;
  onRemove: () => void;
}) {
  const setResult = (i: number, patch: Partial<CaseStudy["results"][number]>) =>
    onChange({ results: value.results.map((r, j) => (j === i ? { ...r, ...patch } : r)) });

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm text-subtle">Заголовок кейса *</span>
          <input className="field" value={value.title} onChange={(e) => onChange({ title: e.target.value })} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-subtle">
            Главная метрика — крупно на карточке
          </span>
          <input
            className="field"
            value={value.metric}
            onChange={(e) => onChange({ metric: e.target.value })}
            placeholder="−70% нагрузки на операторов"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-sm text-subtle">Ниша</span>
          <input className="field" value={value.niche} onChange={(e) => onChange({ niche: e.target.value })} placeholder="E-commerce" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-subtle">Решение</span>
          <select
            className="field"
            value={value.solutionSlug}
            onChange={(e) => {
              const found = solutions.find((s) => s.slug === e.target.value);
              onChange({ solutionSlug: e.target.value, solutionName: found?.name ?? "" });
            }}
          >
            {solutions.map((s) => (
              <option key={s.slug} value={s.slug}>{s.name}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-subtle">Slug (адрес страницы)</span>
          <input
            className="field font-mono text-sm"
            value={value.slug}
            onChange={(e) => onChange({ slug: e.target.value })}
            placeholder="только латиница и дефисы"
          />
        </label>
      </div>

      {([
        ["context", "Контекст и задача"],
        ["challenge", "Что было сложно"],
        ["approach", "Что мы сделали"],
      ] as const).map(([field, label]) => (
        <label key={field} className="block">
          <span className="mb-1 block text-sm text-subtle">{label}</span>
          <textarea
            className="field min-h-20"
            value={value[field]}
            onChange={(e) => onChange({ [field]: e.target.value } as Partial<CaseStudy>)}
          />
        </label>
      ))}

      <label className="block">
        <span className="mb-1 block text-sm text-subtle">Технологии — через запятую</span>
        <input
          className="field"
          value={value.tech.join(", ")}
          onChange={(e) => onChange({ tech: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
          placeholder="RAG, LLM API, Telegram, CRM"
        />
      </label>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-subtle">Результаты «было → стало»</span>
          <button
            type="button"
            onClick={() => onChange({ results: [...value.results, { label: "", before: "", after: "" }] })}
            className="rounded-lg border border-cyanb/40 px-3 py-1 text-xs text-cyanb-l hover:bg-cyanb/10"
          >
            + строка
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {value.results.map((r, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[1fr_auto_1fr_auto]">
              <input className="field !py-1.5 text-sm" value={r.label} onChange={(e) => setResult(i, { label: e.target.value })} placeholder="Что измеряем" />
              <input className="field !py-1.5 text-sm sm:w-28" value={r.before} onChange={(e) => setResult(i, { before: e.target.value })} placeholder="было" />
              <input className="field !py-1.5 text-sm sm:w-28" value={r.after} onChange={(e) => setResult(i, { after: e.target.value })} placeholder="стало" />
              <button
                type="button"
                onClick={() => onChange({ results: value.results.filter((_, j) => j !== i) })}
                className="rounded-lg border border-error/30 px-2.5 text-sm text-error/70 hover:bg-error/10"
                aria-label="Удалить строку"
              >
                ×
              </button>
            </div>
          ))}
          {value.results.length === 0 && <p className="text-xs text-subtle">Строк пока нет.</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2.5 text-sm text-subtle">
          <input type="checkbox" className="size-4 accent-indigo-500" checked={!!value.nda} onChange={(e) => onChange({ nda: e.target.checked })} />
          Под NDA — показывать нишу вместо названия клиента
        </label>
        <button type="button" onClick={onRemove} className="ml-auto text-xs text-error/80 hover:text-error">
          Удалить кейс
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import type { Lead, LeadStatus } from "@/lib/leads";

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "Новая",
  in_progress: "В работе",
  closed: "Закрыта",
};
const STATUS_STYLE: Record<LeadStatus, string> = {
  new: "bg-cyanb/15 text-cyanb-l border-cyanb/40",
  in_progress: "bg-warning/15 text-warning border-warning/40",
  closed: "bg-primary-l/10 text-subtle border-primary-l/25",
};
const ORDER: LeadStatus[] = ["new", "in_progress", "closed"];

export default function LeadsTable({
  initial,
  solutionNames,
}: {
  initial: Lead[];
  solutionNames: Record<string, string>;
}) {
  const [leads, setLeads] = useState(initial);
  const [filter, setFilter] = useState<LeadStatus | "all">("all");
  const [saving, setSaving] = useState<string | null>(null);

  async function patch(id: string, body: Partial<Pick<Lead, "status" | "note">>) {
    setSaving(id);
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...body } : l)));
    try {
      await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...body }),
      });
    } finally {
      setSaving(null);
    }
  }

  const shown = filter === "all" ? leads : leads.filter((l) => l.status === filter);

  return (
    <>
      <div className="mb-5 flex flex-wrap gap-2">
        {(["all", ...ORDER] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
              filter === f ? "border-primary text-primary-l" : "border-primary-l/20 text-subtle hover:text-white"
            }`}
          >
            {f === "all" ? "Все" : STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="rounded-xl border border-primary-l/15 bg-ink2/40 px-6 py-10 text-center text-subtle">
          {leads.length === 0 ? "Заявок пока нет." : "Нет заявок в этом статусе."}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {shown.map((l) => (
            <div key={l.id} className="rounded-xl border border-primary-l/15 bg-ink2/40 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-display text-[17px] font-semibold">{l.name || "—"}</span>
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs ${STATUS_STYLE[l.status]}`}>
                      {STATUS_LABEL[l.status]}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-sm text-cyanb-l">{l.contact}</p>
                </div>
                <div className="text-right font-mono text-xs text-subtle">
                  {new Date(l.at).toLocaleString("ru-RU")}
                  <div className="mt-0.5">
                    {solutionNames[l.solution] ?? l.solution ?? "—"} · {l.source}
                  </div>
                </div>
              </div>

              {l.message && <p className="mt-3 text-[15px] text-subtle">{l.message}</p>}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {ORDER.map((s) => (
                  <button
                    key={s}
                    disabled={l.status === s || saving === l.id}
                    onClick={() => patch(l.id, { status: s })}
                    className={`rounded-lg border px-3 py-1.5 text-xs transition-colors disabled:opacity-40 ${STATUS_STYLE[s]}`}
                  >
                    {STATUS_LABEL[s]}
                  </button>
                ))}
                <input
                  defaultValue={l.note}
                  placeholder="Заметка менеджера…"
                  onBlur={(e) => e.target.value !== l.note && patch(l.id, { note: e.target.value })}
                  className="field ml-auto min-w-[200px] flex-1 !py-1.5 text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

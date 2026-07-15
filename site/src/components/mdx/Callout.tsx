import type { ReactNode } from "react";

const LABELS: Record<string, string> = {
  important: "Важно",
  example: "Пример",
};

/** Врезка-callout в статьях (ТЗ §4.5): «важно», «пример». */
export default function Callout({ type = "important", children }: { type?: string; children: ReactNode }) {
  return (
    <aside className="my-6 flex gap-3.5 rounded-[14px] border border-primary/25 bg-primary/6 px-5 py-4 text-[15.5px]">
      <span
        aria-hidden
        className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-magenta text-[13px] font-bold text-white"
      >
        !
      </span>
      <div>
        <b className="font-display">{LABELS[type] ?? LABELS.important}.</b> {children}
      </div>
    </aside>
  );
}

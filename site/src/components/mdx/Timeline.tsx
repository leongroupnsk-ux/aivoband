import { asArray } from "@/lib/mdx-props";

interface Step {
  when: string;
  title: string;
  text: string;
}

/** Таймлайн этапов внедрения. */
export default function Timeline({ items }: { items: Step[] | string }) {
  const list = asArray<Step>(items);
  return (
    <ol className="my-8 !list-none !pl-0">
      {list.map((s, i) => (
        <li key={s.title} className="relative !mb-0 flex gap-5 pb-7 last:pb-0">
          {i < list.length - 1 && (
            <span aria-hidden className="absolute left-[15px] top-8 h-[calc(100%-24px)] w-px bg-line" />
          )}
          <span
            aria-hidden
            className="z-10 grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-magenta font-mono text-[13px] font-bold text-white"
          >
            {i + 1}
          </span>
          <div className="pt-0.5">
            <span className="font-mono text-[12px] uppercase tracking-wide text-primary-d">{s.when}</span>
            <h3 className="mt-1 font-display text-[18px] font-semibold">{s.title}</h3>
            <p className="mt-1.5 !mb-0 text-[15.5px] text-mutedc">{s.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

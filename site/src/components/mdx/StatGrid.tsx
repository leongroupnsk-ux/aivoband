import { asArray } from "@/lib/mdx-props";

interface Stat {
  value: string;
  label: string;
}

/** Плитки ключевых показателей сценария. */
export default function StatGrid({ items }: { items: Stat[] | string }) {
  const list = asArray<Stat>(items);
  return (
    <div className="my-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((s) => (
        <div key={s.label} className="rounded-[14px] border border-line bg-white/60 px-5 py-4">
          <div className="grad-text font-display text-[26px] font-bold leading-tight">{s.value}</div>
          <p className="mt-1 !mb-0 text-[14px] text-mutedc">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

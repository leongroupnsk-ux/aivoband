import { asArray } from "@/lib/mdx-props";

interface Row {
  label: string;
  before: number;
  after: number;
}

/**
 * Горизонтальный график «до / после» для сценариев внедрения.
 * betterIs="less" — меньше лучше (время ответа), "more" — больше лучше (конверсия).
 * Без внешних библиотек: CSS-полосы, доступный текстовый эквивалент рядом.
 */
export default function BarCompare({
  data,
  unit = "",
  betterIs = "less",
  caption,
}: {
  data: Row[] | string;
  unit?: string;
  betterIs?: "less" | "more";
  caption?: string;
}) {
  const rows = asArray<Row>(data);
  const max = Math.max(...rows.flatMap((r) => [r.before, r.after])) || 1;
  const fmt = (n: number) => `${n.toLocaleString("ru-RU")}${unit ? " " + unit : ""}`;

  return (
    <figure className="my-8 rounded-[16px] border border-line bg-white/60 p-6">
      <div className="flex flex-col gap-6">
        {rows.map((r) => {
          const improved = betterIs === "less" ? r.after < r.before : r.after > r.before;
          return (
            <div key={r.label}>
              <div className="mb-2 flex items-baseline justify-between gap-4">
                <span className="text-[15px] font-medium">{r.label}</span>
                <span className="font-mono text-[13px] text-mutedc">
                  {fmt(r.before)} <span aria-hidden>→</span>{" "}
                  <b className={improved ? "text-primary-d" : "text-mutedc"}>{fmt(r.after)}</b>
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-14 shrink-0 font-mono text-[11px] uppercase text-mutedc">было</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-line/60">
                    <div className="h-full rounded-full bg-mutedc/40" style={{ width: `${(r.before / max) * 100}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-14 shrink-0 font-mono text-[11px] uppercase text-mutedc">стало</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-line/60">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-magenta"
                      style={{ width: `${(r.after / max) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {caption && <figcaption className="mt-5 text-[13.5px] text-mutedc">{caption}</figcaption>}
    </figure>
  );
}

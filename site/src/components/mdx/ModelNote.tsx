import type { ReactNode } from "react";
import { asArray } from "@/lib/mdx-props";

/**
 * Блок честности: помечает расчёт как модельный и раскрывает допущения.
 * Обязателен там, где в сценарии появляются цифры — чтобы читатель не принял
 * их за достигнутый клиентский результат.
 */
export default function ModelNote({
  assumptions,
  children,
}: {
  assumptions?: string[] | string;
  children?: ReactNode;
}) {
  const list = asArray<string>(assumptions);
  return (
    <aside className="my-8 rounded-[14px] border border-dashed border-mutedc/40 bg-mutedc/5 px-5 py-4 text-[14.5px]">
      <p className="!mb-2 font-display text-[15px] font-semibold">Это модельный расчёт, а не результат клиента</p>
      {children && <div className="text-mutedc [&>p]:!mb-2">{children}</div>}
      {list.length > 0 && (
        <>
          <p className="!mb-1.5 !mt-3 text-[13.5px] font-medium text-mutedc">Допущения расчёта:</p>
          <ul className="!mb-0 text-[14px] text-mutedc">
            {list.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </>
      )}
    </aside>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PostMeta } from "@/lib/blog";

/** Индекс блога (ТЗ §4.5): фильтр по рубрикам + поиск, клиентская фильтрация. */
export default function BlogExplorer({
  posts,
  categories,
}: {
  posts: (PostMeta & { dateLabel: string })[];
  categories: Record<string, string>;
}) {
  const [cat, setCat] = useState<string>("");
  const [q, setQ] = useState("");

  const usedCats = useMemo(
    () => Object.entries(categories).filter(([key]) => posts.some((p) => p.category === key)),
    [posts, categories]
  );

  const filtered = posts.filter(
    (p) =>
      (!cat || p.category === cat) &&
      (!q || (p.title + " " + p.excerpt).toLowerCase().includes(q.toLowerCase()))
  );

  const [featured, ...rest] = filtered;

  return (
    <>
      <div className="mt-12 flex flex-wrap items-center gap-2.5">
        <button
          onClick={() => setCat("")}
          className={`tag cursor-pointer transition-colors ${!cat ? "!border-primary !text-primary-l" : "hover:border-primary/60"}`}
        >
          Все
        </button>
        {usedCats.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setCat(cat === key ? "" : key)}
            className={`tag cursor-pointer transition-colors ${cat === key ? "!border-primary !text-primary-l" : "hover:border-primary/60"}`}
          >
            {label}
          </button>
        ))}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск…"
          className="field ml-auto max-w-56 !py-2.5 text-sm"
          aria-label="Поиск по статьям"
        />
      </div>

      {!filtered.length && (
        <p className="mt-14 text-subtle">
          Ничего не нашлось. Попробуйте другой запрос — или посмотрите{" "}
          <button onClick={() => { setCat(""); setQ(""); }} className="cursor-pointer text-primary-l underline underline-offset-4">
            все статьи
          </button>.
        </p>
      )}

      {featured && (
        <Link
          href={`/blog/${featured.slug}`}
          className="card-n mt-10 grid gap-7 md:grid-cols-[1.1fr_1.4fr] md:items-center"
          data-glow="indigo"
        >
          <div
            aria-hidden
            className="h-44 rounded-xl"
            style={{
              background:
                "radial-gradient(240px 130px at 70% 30%, rgba(236,72,153,.35), transparent 60%), radial-gradient(280px 150px at 25% 70%, rgba(34,211,238,.3), transparent 60%), linear-gradient(135deg,#0d0a22,#1e1a4a)",
            }}
          />
          <div>
            <span className="font-mono text-[11.5px] text-primary-l">
              {categories[featured.category]} · {featured.dateLabel} · {featured.readingMinutes} мин
            </span>
            <h2 className="mt-2.5 font-display text-[24px] font-semibold">{featured.title}</h2>
            <p className="mt-2.5 text-[15px] text-subtle">{featured.excerpt}</p>
          </div>
        </Link>
      )}

      {rest.length > 0 && (
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="card-n flex h-full flex-col" data-glow="cyan">
              <span className="font-mono text-[11.5px] text-primary-l">
                {categories[p.category]} · {p.dateLabel} · {p.readingMinutes} мин
              </span>
              <h2 className="mt-2.5 font-display text-[18px] font-semibold">{p.title}</h2>
              <p className="mt-2 flex-1 text-[14px] text-subtle">{p.excerpt}</p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import type { StoredPost } from "@/lib/blog";

type SolutionOpt = { slug: string; name: string };

const emptyDraft = (): StoredPost => ({
  slug: "",
  title: "",
  excerpt: "",
  category: "guides",
  date: new Date().toISOString().slice(0, 10),
  author: "Команда Aivo",
  solution: undefined,
  draft: true,
  readingMinutes: 0,
  body: "## Подзаголовок\n\nТекст статьи. Поддерживается **Markdown**: списки, ссылки, `код`, цитаты.\n",
});

export default function BlogEditor({
  initialPosts,
  categories,
  solutions,
}: {
  initialPosts: StoredPost[];
  categories: Record<string, string>;
  solutions: SolutionOpt[];
}) {
  const [posts, setPosts] = useState<StoredPost[]>(initialPosts);
  const [editing, setEditing] = useState<(StoredPost & { originalSlug?: string }) | null>(null);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);

  function startNew() {
    setStatus(null);
    setEditing(emptyDraft());
  }
  function startEdit(p: StoredPost) {
    setStatus(null);
    setEditing({ ...p, originalSlug: p.slug });
  }

  async function save() {
    if (!editing) return;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/blog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      const json = await res.json();
      if (!res.ok) {
        setStatus({ ok: false, msg: json.error ?? "Ошибка сохранения" });
        return;
      }
      // обновляем список локально
      const saved: StoredPost = { ...editing, slug: json.slug };
      setPosts((prev) => {
        const withoutOld = prev.filter((p) => p.slug !== editing.originalSlug && p.slug !== json.slug);
        return [saved, ...withoutOld].sort((a, b) => (a.date < b.date ? 1 : -1));
      });
      setStatus({ ok: true, msg: editing.draft ? "Сохранено как черновик." : "Опубликовано ✓ Уже на сайте." });
      setEditing(null);
    } catch {
      setStatus({ ok: false, msg: "Ошибка сети" });
    } finally {
      setBusy(false);
    }
  }

  async function remove(slug: string) {
    if (!confirm("Удалить статью безвозвратно?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/blog?slug=${encodeURIComponent(slug)}`, { method: "DELETE" });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.slug !== slug));
        setStatus({ ok: true, msg: "Статья удалена." });
      }
    } finally {
      setBusy(false);
    }
  }

  // ── Форма редактирования ──
  if (editing) {
    const set = (patch: Partial<StoredPost>) => setEditing((e) => (e ? { ...e, ...patch } : e));
    return (
      <div>
        {status && !status.ok && (
          <p className="mb-4 rounded-lg border border-error/40 bg-error/10 px-4 py-2.5 text-sm text-error">{status.msg}</p>
        )}
        <div className="flex flex-col gap-4">
          <label className="block">
            <span className="mb-1 block text-sm text-subtle">Заголовок *</span>
            <input className="field" value={editing.title} onChange={(e) => set({ title: e.target.value })} placeholder="Как работает RAG" />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm text-subtle">Slug (URL, необязательно)</span>
              <input className="field font-mono text-sm" value={editing.slug} onChange={(e) => set({ slug: e.target.value })} placeholder="из заголовка" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-subtle">Дата</span>
              <input type="date" className="field" value={editing.date} onChange={(e) => set({ date: e.target.value })} />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm text-subtle">Краткое описание (для карточки и SEO)</span>
            <textarea className="field min-h-20" value={editing.excerpt} onChange={(e) => set({ excerpt: e.target.value })} />
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-sm text-subtle">Категория</span>
              <select className="field" value={editing.category} onChange={(e) => set({ category: e.target.value })}>
                {Object.entries(categories).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-subtle">Автор</span>
              <input className="field" value={editing.author} onChange={(e) => set({ author: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-subtle">Решение (CTA в статье)</span>
              <select className="field" value={editing.solution ?? ""} onChange={(e) => set({ solution: e.target.value || undefined })}>
                <option value="">— нет —</option>
                {solutions.map((s) => (
                  <option key={s.slug} value={s.slug}>{s.name}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm text-subtle">
              Текст статьи (Markdown). Заголовки разделов — <code className="text-cyanb-l">## Заголовок</code> (попадут в оглавление).
            </span>
            <textarea
              spellCheck={false}
              className="field min-h-[360px] font-mono text-[13px] leading-relaxed"
              value={editing.body}
              onChange={(e) => set({ body: e.target.value })}
            />
          </label>

          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" className="size-4 accent-indigo-500" checked={!!editing.draft} onChange={(e) => set({ draft: e.target.checked })} />
            <span className="text-subtle">Черновик (не показывать на сайте)</span>
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <button onClick={save} disabled={busy} className="btn btn-primary !px-6 !py-2 text-sm">
              {busy ? "Сохраняю…" : editing.draft ? "Сохранить черновик" : "Опубликовать"}
            </button>
            <button onClick={() => { setEditing(null); setStatus(null); }} disabled={busy} className="rounded-lg border border-primary-l/25 px-4 py-2 text-sm text-subtle hover:text-white">
              Отмена
            </button>
            {editing.originalSlug && !editing.draft && (
              <a href={`/blog/${editing.slug || editing.originalSlug}`} target="_blank" rel="noreferrer" className="ml-auto text-sm text-primary-l hover:underline">
                Открыть на сайте ↗
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Список статей ──
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-subtle">Статей: {posts.length}</p>
        <button onClick={startNew} className="btn btn-primary !px-5 !py-1.5 text-sm">+ Новая статья</button>
      </div>

      {status && (
        <p className={`mb-4 rounded-lg border px-4 py-2.5 text-sm ${status.ok ? "border-cyanb/40 bg-cyanb/10 text-cyanb-l" : "border-error/40 bg-error/10 text-error"}`}>
          {status.msg}
        </p>
      )}

      {posts.length === 0 ? (
        <p className="rounded-xl border border-primary-l/15 bg-ink2/40 px-6 py-10 text-center text-subtle">
          Пока нет статей, созданных из админки. Демо-статьи из репозитория показываются на сайте, но правятся в коде.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((p) => (
            <div key={p.slug} className="flex flex-wrap items-center gap-3 rounded-xl border border-primary-l/15 bg-ink2/40 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-display text-[16px] font-medium">{p.title || "(без заголовка)"}</span>
                  {p.draft && <span className="rounded-full border border-warning/40 bg-warning/15 px-2 py-0.5 text-xs text-warning">черновик</span>}
                </div>
                <p className="mt-0.5 font-mono text-xs text-subtle">
                  {categories[p.category] ?? p.category} · {p.date} · /blog/{p.slug}
                </p>
              </div>
              <button onClick={() => startEdit(p)} className="rounded-lg border border-primary/40 px-3.5 py-1.5 text-sm text-primary-l hover:bg-primary/10">
                Править
              </button>
              <button onClick={() => remove(p.slug)} disabled={busy} className="rounded-lg border border-error/30 px-3.5 py-1.5 text-sm text-error/80 hover:bg-error/10">
                Удалить
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

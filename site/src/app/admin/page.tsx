import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { listLeads, leadStats } from "@/lib/leads";
import { solutions } from "@/data/solutions";
import LeadsTable from "@/components/admin/LeadsTable";

export const dynamic = "force-dynamic"; // всегда свежие заявки

export default async function AdminPage() {
  if (!(await isAuthed())) redirect("/admin/login");

  const leads = listLeads();
  const stats = leadStats();
  const solutionNames = Object.fromEntries(solutions.map((s) => [s.slug, s.name]));

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Заявки</h1>
          <p className="mt-1 text-sm text-subtle">
            Всего: {stats.total} · новых: {stats.new} · за неделю: {stats.week}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/content"
            className="rounded-full border border-primary/40 px-4 py-2 text-sm text-primary-l transition-colors hover:bg-primary/10"
          >
            Контент
          </Link>
          <Link
            href="/admin/blog"
            className="rounded-full border border-primary/40 px-4 py-2 text-sm text-primary-l transition-colors hover:bg-primary/10"
          >
            Блог
          </Link>
          <form action="/api/admin/logout" method="post">
            <button
              type="submit"
              className="rounded-full border border-primary-l/25 px-4 py-2 text-sm text-subtle transition-colors hover:text-white"
              formAction="/api/admin/logout"
            >
              Выйти
            </button>
          </form>
        </div>
      </header>

      <LeadsTable initial={leads} solutionNames={solutionNames} />
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { listRuntimeScenarios, getAllScenarios } from "@/lib/scenarios";
import { defaultSolutions } from "@/lib/content-store";
import ScenarioEditor from "@/components/admin/ScenarioEditor";

export const dynamic = "force-dynamic";

export default async function AdminScenariosPage() {
  if (!(await isAuthed())) redirect("/admin/login");

  const runtime = listRuntimeScenarios();
  const runtimeSlugs = new Set(runtime.map((s) => s.slug));
  const fromFiles = getAllScenarios()
    .filter((s) => !runtimeSlugs.has(s.slug))
    .map((s) => ({ slug: s.slug, title: s.title, niche: s.niche }));

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Сценарии внедрения</h1>
          <p className="mt-1 text-sm text-subtle">Модельные разборы по отраслям — публикация без пересборки</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/blog" className="rounded-full border border-primary-l/25 px-4 py-2 text-sm text-subtle transition-colors hover:text-white">
            Блог
          </Link>
          <Link href="/admin/content" className="rounded-full border border-primary-l/25 px-4 py-2 text-sm text-subtle transition-colors hover:text-white">
            Контент
          </Link>
          <Link href="/admin" className="rounded-full border border-primary-l/25 px-4 py-2 text-sm text-subtle transition-colors hover:text-white">
            ← К заявкам
          </Link>
        </div>
      </header>

      <ScenarioEditor
        initial={runtime}
        solutions={defaultSolutions.map((s) => ({ slug: s.slug, name: s.name }))}
        fileScenarios={fromFiles}
      />
    </div>
  );
}

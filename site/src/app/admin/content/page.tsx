import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { getCases, getSolutions } from "@/lib/content-store";
import ContentEditor from "@/components/admin/ContentEditor";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  if (!(await isAuthed())) redirect("/admin/login");

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Контент</h1>
          <p className="mt-1 text-sm text-subtle">Кейсы и решения — правка без пересборки сайта</p>
        </div>
        <Link href="/admin" className="rounded-full border border-primary-l/25 px-4 py-2 text-sm text-subtle transition-colors hover:text-white">
          ← К заявкам
        </Link>
      </header>

      <ContentEditor initialCases={getCases()} initialSolutions={getSolutions()} />
    </div>
  );
}

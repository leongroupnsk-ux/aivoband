import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { listRuntimePosts, CATEGORIES } from "@/lib/blog";
import { defaultSolutions } from "@/lib/content-store";
import BlogEditor from "@/components/admin/BlogEditor";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  if (!(await isAuthed())) redirect("/admin/login");

  const posts = listRuntimePosts();
  const solutionOptions = defaultSolutions.map((s) => ({ slug: s.slug, name: s.name }));

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Блог</h1>
          <p className="mt-1 text-sm text-subtle">Статьи — публикация без пересборки сайта</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/content" className="rounded-full border border-primary-l/25 px-4 py-2 text-sm text-subtle transition-colors hover:text-white">
            Контент
          </Link>
          <Link href="/admin" className="rounded-full border border-primary-l/25 px-4 py-2 text-sm text-subtle transition-colors hover:text-white">
            ← К заявкам
          </Link>
        </div>
      </header>

      <BlogEditor initialPosts={posts} categories={CATEGORIES} solutions={solutionOptions} />
    </div>
  );
}

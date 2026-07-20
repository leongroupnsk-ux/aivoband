import { NextRequest, NextResponse } from "next/server";
import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import { isAuthed } from "@/lib/auth";
import {
  CATEGORIES,
  slugify,
  slugExistsAsFile,
  upsertRuntimePost,
  deleteRuntimePost,
  listRuntimePosts,
  type StoredPost,
} from "@/lib/blog";

const isStr = (v: unknown): v is string => typeof v === "string";

/** Проверяем, что тело компилируется как MDX — иначе страница статьи упадёт. */
async function bodyCompiles(body: string): Promise<string | null> {
  try {
    await compile(body, { remarkPlugins: [remarkGfm] });
    return null;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return `Ошибка в тексте (MDX): ${msg.split("\n")[0]}`;
  }
}

export async function PUT(req: NextRequest) {
  if (!(await isAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const b = await req.json().catch(() => null);
  if (!b) return NextResponse.json({ error: "bad json" }, { status: 400 });

  const title = isStr(b.title) ? b.title.trim() : "";
  if (!title) return NextResponse.json({ error: "Заголовок обязателен" }, { status: 400 });

  const providedSlug = isStr(b.slug) ? b.slug.trim() : "";
  const originalSlug = isStr(b.originalSlug) ? b.originalSlug.trim() : ""; // при редактировании
  const slug = slugify(providedSlug || title);
  if (!slug) return NextResponse.json({ error: "Не удалось построить slug из заголовка" }, { status: 400 });

  // не даём затенять демо-статью из файлов (кроме случая, когда правим ту же рантайм-статью)
  if (slug !== originalSlug && slugExistsAsFile(slug)) {
    return NextResponse.json({ error: `Slug «${slug}» занят файловой статьёй — задайте другой` }, { status: 400 });
  }

  const category = isStr(b.category) && CATEGORIES[b.category] ? b.category : "guides";
  const body = isStr(b.body) ? b.body : "";
  const compileErr = await bodyCompiles(body);
  if (compileErr) return NextResponse.json({ error: compileErr }, { status: 400 });

  const post: StoredPost = {
    slug,
    title,
    excerpt: isStr(b.excerpt) ? b.excerpt.trim() : "",
    category,
    date: isStr(b.date) && b.date ? b.date : new Date().toISOString().slice(0, 10),
    author: isStr(b.author) && b.author.trim() ? b.author.trim() : "Команда Aivo",
    solution: isStr(b.solution) && b.solution ? b.solution : undefined,
    draft: !!b.draft,
    readingMinutes: 0, // вычисляется при чтении
    body,
  };

  // если slug изменился при редактировании — удаляем старую запись
  if (originalSlug && originalSlug !== slug) deleteRuntimePost(originalSlug);
  upsertRuntimePost(post);

  return NextResponse.json({ ok: true, slug });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });
  deleteRuntimePost(slug);
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  if (!(await isAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ posts: listRuntimePosts() });
}

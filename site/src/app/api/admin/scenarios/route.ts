import { NextRequest, NextResponse } from "next/server";
import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import { isAuthed } from "@/lib/auth";
import {
  upsertRuntimeScenario,
  deleteRuntimeScenario,
  listRuntimeScenarios,
  slugExistsAsFile,
  type StoredScenario,
} from "@/lib/scenarios";
import { defaultSolutions } from "@/lib/content-store";
import { translitSlug } from "@/lib/slug";

const isStr = (v: unknown): v is string => typeof v === "string";

/** Тело должно компилироваться как MDX, иначе страница разбора упадёт. */
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

  const originalSlug = isStr(b.originalSlug) ? b.originalSlug.trim() : "";
  const slug = translitSlug(isStr(b.slug) && b.slug.trim() ? b.slug : title);
  if (!slug) return NextResponse.json({ error: "Не удалось построить slug из заголовка" }, { status: 400 });

  if (slug !== originalSlug && slugExistsAsFile(slug)) {
    return NextResponse.json({ error: `Slug «${slug}» занят сценарием из репозитория — задайте другой` }, { status: 400 });
  }

  const body = isStr(b.body) ? b.body : "";
  const compileErr = await bodyCompiles(body);
  if (compileErr) return NextResponse.json({ error: compileErr }, { status: 400 });

  const solution = isStr(b.solution) && b.solution ? b.solution : undefined;
  const solutionName = solution ? defaultSolutions.find((s) => s.slug === solution)?.name : undefined;

  const scenario: StoredScenario = {
    slug,
    niche: isStr(b.niche) ? b.niche.trim() : "",
    title,
    tagline: isStr(b.tagline) ? b.tagline.trim() : "",
    solution,
    solutionName,
    order: Number.isFinite(Number(b.order)) ? Number(b.order) : 99,
    readingMinutes: 0, // вычисляется при чтении
    body,
  };

  if (originalSlug && originalSlug !== slug) deleteRuntimeScenario(originalSlug);
  upsertRuntimeScenario(scenario);

  return NextResponse.json({ ok: true, slug });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });
  deleteRuntimeScenario(slug);
  return NextResponse.json({ ok: true });
}

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ scenarios: listRuntimeScenarios() });
}

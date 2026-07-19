import { NextRequest, NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import {
  saveCases,
  saveSolutions,
  resetCases,
  resetSolutions,
  defaultCases,
  defaultSolutions,
  type CaseStudy,
  type Solution,
} from "@/lib/content-store";

const isStr = (v: unknown): v is string => typeof v === "string";
const isStrArr = (v: unknown): v is string[] => Array.isArray(v) && v.every(isStr);

function validateCases(data: unknown): string | null {
  if (!Array.isArray(data)) return "Ожидается массив кейсов";
  const slugs = new Set<string>();
  for (const [i, c] of data.entries()) {
    const o = c as Record<string, unknown>;
    const where = `Кейс #${i + 1}`;
    for (const f of ["slug", "niche", "solutionSlug", "solutionName", "metric", "title", "context", "challenge", "approach"]) {
      if (!isStr(o[f])) return `${where}: поле «${f}» должно быть строкой`;
    }
    if (!/^[a-z0-9-]+$/.test(o.slug as string)) return `${where}: slug — только латиница, цифры, дефис`;
    if (slugs.has(o.slug as string)) return `${where}: дублирующийся slug «${o.slug}»`;
    slugs.add(o.slug as string);
    if (!isStrArr(o.tech)) return `${where}: «tech» должно быть массивом строк`;
    if (typeof o.nda !== "boolean") return `${where}: «nda» должно быть true/false`;
    if (!Array.isArray(o.results)) return `${where}: «results» должно быть массивом`;
    for (const r of o.results as unknown[]) {
      const ro = r as Record<string, unknown>;
      if (!isStr(ro.label) || !isStr(ro.before) || !isStr(ro.after))
        return `${where}: каждый результат — {label, before, after} строками`;
    }
  }
  return null;
}

function validateSolutions(data: unknown): string | null {
  if (!Array.isArray(data)) return "Ожидается массив решений";
  const defSlugs = defaultSolutions.map((s) => s.slug).sort().join(",");
  const gotSlugs = data.map((s) => (s as Record<string, unknown>).slug).sort().join(",");
  if (defSlugs !== gotSlugs) return "Набор решений менять нельзя: slug'и должны совпадать с исходными (можно править только контент)";
  for (const [i, s] of data.entries()) {
    const o = s as Record<string, unknown>;
    const where = `Решение #${i + 1}`;
    for (const f of ["slug", "name", "short", "icon", "glow", "eyebrow", "h1", "sub"]) {
      if (!isStr(o[f])) return `${where}: поле «${f}» должно быть строкой`;
    }
    if (o.price !== undefined && !isStr(o.price)) return `${where}: «price» должно быть строкой`;
    if (!isStrArr(o.forWho)) return `${where}: «forWho» — массив строк`;
    if (!isStrArr(o.includes)) return `${where}: «includes» — массив строк`;
    if (!isStrArr(o.priceNote)) return `${where}: «priceNote» — массив строк`;
    if (!Array.isArray(o.benefits)) return `${where}: «benefits» — массив`;
    if (!Array.isArray(o.steps)) return `${where}: «steps» — массив`;
  }
  return null;
}

export async function PUT(req: NextRequest) {
  if (!(await isAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const kind = body?.kind;
  const data = body?.data;

  if (kind === "cases") {
    const err = validateCases(data);
    if (err) return NextResponse.json({ error: err }, { status: 400 });
    saveCases(data as CaseStudy[]);
    return NextResponse.json({ ok: true });
  }
  if (kind === "solutions") {
    const err = validateSolutions(data);
    if (err) return NextResponse.json({ error: err }, { status: 400 });
    saveSolutions(data as Solution[]);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Неизвестный тип контента" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  if (!(await isAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (body?.action !== "reset") return NextResponse.json({ error: "bad action" }, { status: 400 });

  if (body.kind === "cases") {
    resetCases();
    return NextResponse.json({ ok: true, data: defaultCases });
  }
  if (body.kind === "solutions") {
    resetSolutions();
    return NextResponse.json({ ok: true, data: defaultSolutions });
  }
  return NextResponse.json({ error: "Неизвестный тип" }, { status: 400 });
}

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * «Сценарии внедрения» — подробные модельные разборы: как задача решается в нише.
 * ЭТО НЕ КЕЙСЫ КЛИЕНТОВ. Цифры внутри — модельные расчёты с раскрытыми допущениями
 * (см. компонент ModelNote). Реальные клиентские кейсы живут в /cases.
 */

export interface ScenarioMeta {
  slug: string;
  niche: string; // «E-commerce», «Клиники», …
  title: string;
  tagline: string; // одна строка: какую боль закрывает
  solution?: string; // slug решения для CTA
  solutionName?: string;
  order?: number;
  readingMinutes: number;
}

export interface Scenario extends ScenarioMeta {
  content: string;
  headings: { id: string; text: string }[];
}

const DIR = path.join(process.cwd(), "content", "scenarios");
const RUNTIME_FILE = path.join(process.env.DATA_DIR ?? path.join(process.cwd(), ".data"), "content", "scenarios.json");

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "").trim().replace(/\s+/g, "-");
}

function readingTime(content: string): number {
  return Math.max(1, Math.round(content.split(/\s+/).length / 180));
}

function build(meta: Partial<ScenarioMeta> & { slug: string }, content: string): Scenario {
  const headings = [...content.matchAll(/^##\s+(.+)$/gm)].map((m) => ({ id: slugify(m[1]), text: m[1] }));
  return {
    slug: meta.slug,
    niche: meta.niche ?? "",
    title: meta.title ?? "",
    tagline: meta.tagline ?? "",
    solution: meta.solution,
    solutionName: meta.solutionName,
    order: meta.order ?? 99,
    readingMinutes: readingTime(content),
    content,
    headings,
  };
}

function fileScenarios(): Scenario[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => /\.mdx?$/.test(f))
    .map((f) => {
      const { data, content } = matter(fs.readFileSync(path.join(DIR, f), "utf8"));
      return build({ ...(data as Partial<ScenarioMeta>), slug: f.replace(/\.mdx?$/, "") }, content);
    });
}

export interface StoredScenario extends ScenarioMeta {
  body: string;
}

function readRuntime(): StoredScenario[] {
  try {
    if (!fs.existsSync(RUNTIME_FILE)) return [];
    return JSON.parse(fs.readFileSync(RUNTIME_FILE, "utf8")) as StoredScenario[];
  } catch {
    return [];
  }
}

function writeRuntime(items: StoredScenario[]): void {
  fs.mkdirSync(path.dirname(RUNTIME_FILE), { recursive: true });
  fs.writeFileSync(RUNTIME_FILE, JSON.stringify(items, null, 2), "utf8");
}

export function listRuntimeScenarios(): StoredScenario[] {
  return readRuntime();
}

export function upsertRuntimeScenario(s: StoredScenario): void {
  const items = readRuntime();
  const i = items.findIndex((x) => x.slug === s.slug);
  if (i === -1) items.push(s);
  else items[i] = s;
  writeRuntime(items);
}

export function deleteRuntimeScenario(slug: string): void {
  writeRuntime(readRuntime().filter((s) => s.slug !== slug));
}

export function slugExistsAsFile(slug: string): boolean {
  return ["mdx", "md"].some((ext) => fs.existsSync(path.join(DIR, `${slug}.${ext}`)));
}

export function getAllScenarios(): Scenario[] {
  const runtime = readRuntime().map((s) => build(s, s.body));
  const runtimeSlugs = new Set(runtime.map((s) => s.slug));
  const files = fileScenarios().filter((s) => !runtimeSlugs.has(s.slug));
  return [...runtime, ...files].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export function getScenario(slug: string): Scenario | undefined {
  const runtime = readRuntime().find((s) => s.slug === slug);
  if (runtime) return build(runtime, runtime.body);
  const file = ["mdx", "md"].map((e) => `${slug}.${e}`).find((f) => fs.existsSync(path.join(DIR, f)));
  if (!file) return undefined;
  const { data, content } = matter(fs.readFileSync(path.join(DIR, file), "utf8"));
  return build({ ...(data as Partial<ScenarioMeta>), slug }, content);
}

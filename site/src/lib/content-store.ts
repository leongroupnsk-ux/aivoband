import fs from "node:fs";
import path from "node:path";
import { cases as defaultCases, type CaseStudy } from "@/data/cases";
import { solutions as defaultSolutions, type Solution } from "@/data/solutions";

/**
 * Рантайм-хранилище редактируемого контента (кейсы, решения) на томе aivo-data.
 * Если override-файла нет — отдаём скомпилированные дефолты из data/*.ts.
 * Страницы, читающие это, помечены force-dynamic — правки видны без пересборки.
 *
 * Навигация (Header/Footer/LeadForm) продолжает использовать дефолты из data/*.ts:
 * набор из 6 решений структурный. Правка текста решения видна на его странице сразу,
 * а в пунктах меню (name) — после ближайшей пересборки. Это осознанный компромисс.
 */

export type { CaseStudy, Solution };

const DIR = path.join(process.env.DATA_DIR ?? path.join(process.cwd(), ".data"), "content");
const CASES_FILE = path.join(DIR, "cases.json");
const SOLUTIONS_FILE = path.join(DIR, "solutions.json");

function readJson<T>(file: string): T | null {
  try {
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, "utf8")) as T;
  } catch {
    return null;
  }
}

function writeJson(file: string, data: unknown): void {
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

// ── Кейсы ──────────────────────────────────────────────────────────
export function getCases(): CaseStudy[] {
  return readJson<CaseStudy[]>(CASES_FILE) ?? defaultCases;
}

export function getCaseBySlug(slug: string): CaseStudy | undefined {
  return getCases().find((c) => c.slug === slug);
}

export function saveCases(cases: CaseStudy[]): void {
  writeJson(CASES_FILE, cases);
}

/** true, если контент кейсов взят из override (заказчик что-то менял). */
export function casesAreCustom(): boolean {
  return fs.existsSync(CASES_FILE);
}

// ── Решения ────────────────────────────────────────────────────────
export function getSolutions(): Solution[] {
  const override = readJson<Solution[]>(SOLUTIONS_FILE);
  if (!override) return defaultSolutions;
  // страхуемся: набор slug'ов должен совпадать с дефолтным (структурный),
  // иначе рассинхрон с навигацией — тогда игнорируем битый override
  const defSlugs = new Set(defaultSolutions.map((s) => s.slug));
  const okSlugs =
    override.length === defaultSolutions.length && override.every((s) => defSlugs.has(s.slug));
  return okSlugs ? override : defaultSolutions;
}

export function getSolutionBySlug(slug: string): Solution | undefined {
  return getSolutions().find((s) => s.slug === slug);
}

export function saveSolutions(next: Solution[]): void {
  writeJson(SOLUTIONS_FILE, next);
}

export function solutionsAreCustom(): boolean {
  return fs.existsSync(SOLUTIONS_FILE);
}

export function resetCases(): void {
  if (fs.existsSync(CASES_FILE)) fs.rmSync(CASES_FILE);
}
export function resetSolutions(): void {
  if (fs.existsSync(SOLUTIONS_FILE)) fs.rmSync(SOLUTIONS_FILE);
}

export { defaultCases, defaultSolutions };

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

// MDX-контент блога (ТЗ §7: MDX в репозитории на старте, миграция на CMS позже).
// Модель «Статья» — по ТЗ §7; 10 готовых статей заказчика грузятся в content/blog/.

export const CATEGORIES: Record<string, string> = {
  tech: "Технологии и архитектура",
  guides: "Гайды и как это работает",
  cases: "Кейсы",
  products: "Продукты",
  news: "Новости",
};

export interface PostMeta {
  slug: string;
  title: string;
  excerpt: string;
  category: keyof typeof CATEGORIES | string;
  date: string; // ISO
  author: string;
  readingMinutes: number;
  solution?: string; // slug решения для CTA-перелинковки (SEO-карта §2)
  draft?: boolean;
}

export interface Post extends PostMeta {
  content: string;
  headings: { id: string; text: string }[];
}

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
// Рантайм-статьи (создаются из админки) — на томе aivo-data, переживают пересборку
const RUNTIME_FILE = path.join(process.env.DATA_DIR ?? path.join(process.cwd(), ".data"), "content", "blog.json");

export function slugify(text: string): string {
  // совпадает с rehype-slug (github-slugger) для кириллицы достаточно близко:
  // нижний регистр, пробелы → дефисы, срезаем пунктуацию
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}

function readingTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.round(words / 180));
}

/** Собирает Post из метаданных и Markdown-тела (общее для файлов и рантайм-статей). */
function buildPost(meta: Partial<PostMeta> & { slug: string }, content: string): Post {
  const headings = [...content.matchAll(/^##\s+(.+)$/gm)].map((m) => ({ id: slugify(m[1]), text: m[1] }));
  return {
    slug: meta.slug,
    title: meta.title ?? "",
    excerpt: meta.excerpt ?? "",
    category: meta.category ?? "guides",
    date: meta.date ?? "1970-01-01",
    author: meta.author ?? "Команда Aivo",
    solution: meta.solution,
    draft: meta.draft ?? false,
    readingMinutes: readingTime(content),
    content,
    headings,
  };
}

function parseFile(file: string): Post {
  const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
  const { data, content } = matter(raw);
  return buildPost({ ...(data as Partial<PostMeta>), slug: file.replace(/\.mdx?$/, "") }, content);
}

function filePosts(): Post[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs.readdirSync(BLOG_DIR).filter((f) => /\.mdx?$/.test(f)).map(parseFile);
}

// ── Рантайм-статьи (админка) ───────────────────────────────────────
export interface StoredPost extends PostMeta {
  body: string; // Markdown/MDX
}

function readRuntime(): StoredPost[] {
  try {
    if (!fs.existsSync(RUNTIME_FILE)) return [];
    return JSON.parse(fs.readFileSync(RUNTIME_FILE, "utf8")) as StoredPost[];
  } catch {
    return [];
  }
}

function writeRuntime(posts: StoredPost[]): void {
  fs.mkdirSync(path.dirname(RUNTIME_FILE), { recursive: true });
  fs.writeFileSync(RUNTIME_FILE, JSON.stringify(posts, null, 2), "utf8");
}

/** Список рантайм-статей для админки (включая черновики), без вычисленных полей. */
export function listRuntimePosts(): StoredPost[] {
  return readRuntime().sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function upsertRuntimePost(post: StoredPost): void {
  const posts = readRuntime();
  const i = posts.findIndex((p) => p.slug === post.slug);
  if (i === -1) posts.push(post);
  else posts[i] = post;
  writeRuntime(posts);
}

export function deleteRuntimePost(slug: string): void {
  writeRuntime(readRuntime().filter((p) => p.slug !== slug));
}

/** Все статьи: рантайм + файловые, рантайм побеждает при совпадении slug. */
export function getAllPosts(): Post[] {
  const runtime = readRuntime().map((p) => buildPost(p, p.body));
  const runtimeSlugs = new Set(runtime.map((p) => p.slug));
  const files = filePosts().filter((p) => !runtimeSlugs.has(p.slug));
  return [...runtime, ...files].filter((p) => !p.draft).sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): Post | undefined {
  const runtime = readRuntime().find((p) => p.slug === slug);
  if (runtime) return runtime.draft ? undefined : buildPost(runtime, runtime.body);
  const file = ["mdx", "md"].map((ext) => `${slug}.${ext}`).find((f) => fs.existsSync(path.join(BLOG_DIR, f)));
  if (!file) return undefined;
  const post = parseFile(file);
  return post.draft ? undefined : post;
}

/** Занят ли slug (файловой статьёй) — чтобы не переопределять демо-статьи молча. */
export function slugExistsAsFile(slug: string): boolean {
  return ["mdx", "md"].some((ext) => fs.existsSync(path.join(BLOG_DIR, `${slug}.${ext}`)));
}

export function getRelated(post: Post, count = 3): Post[] {
  const all = getAllPosts().filter((p) => p.slug !== post.slug);
  const sameCat = all.filter((p) => p.category === post.category);
  return [...sameCat, ...all.filter((p) => p.category !== post.category)].slice(0, count);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

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

function slugify(text: string): string {
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

function parseFile(file: string): Post {
  const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
  const { data, content } = matter(raw);
  const headings = [...content.matchAll(/^##\s+(.+)$/gm)].map((m) => ({
    id: slugify(m[1]),
    text: m[1],
  }));
  return {
    slug: file.replace(/\.mdx?$/, ""),
    title: data.title ?? "",
    excerpt: data.excerpt ?? "",
    category: data.category ?? "guides",
    date: data.date ?? "1970-01-01",
    author: data.author ?? "Команда Aivo",
    solution: data.solution,
    draft: data.draft ?? false,
    readingMinutes: readingTime(content),
    content,
    headings,
  };
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => /\.mdx?$/.test(f))
    .map(parseFile)
    .filter((p) => !p.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): Post | undefined {
  const file = ["mdx", "md"].map((ext) => `${slug}.${ext}`).find((f) => fs.existsSync(path.join(BLOG_DIR, f)));
  if (!file) return undefined;
  const post = parseFile(file);
  return post.draft ? undefined : post;
}

export function getRelated(post: Post, count = 3): Post[] {
  const all = getAllPosts().filter((p) => p.slug !== post.slug);
  const sameCat = all.filter((p) => p.category === post.category);
  return [...sameCat, ...all.filter((p) => p.category !== post.category)].slice(0, count);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

/**
 * URL-slug из русского заголовка — транслитом.
 *
 * Зачем транслит: параметр динамического маршрута приходит percent-encoded
 * (`%D1%82%D0%B5...`), кириллические адреса плохо переживают копирование,
 * рассылки и внешние инструменты. Латиница избавляет от целого класса проблем.
 *
 * ВАЖНО: это только для URL. Для якорей заголовков (оглавление) транслит
 * применять нельзя — там id должен совпадать с тем, что генерирует rehype-slug,
 * а он кириллицу сохраняет. Для этого есть отдельная функция slugify в lib/blog.
 */

const MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

export function translitSlug(text: string): string {
  return text
    .toLowerCase()
    .split("")
    .map((ch) => (ch in MAP ? MAP[ch] : ch))
    .join("")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

/** Безопасно декодирует сегмент URL (параметр маршрута приходит закодированным). */
export function decodeSlug(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

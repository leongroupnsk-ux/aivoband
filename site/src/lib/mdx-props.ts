/**
 * В этой сборке Next JSX-выражения в MDX не исполняются (защита: MDX-выражение —
 * это произвольный код, а статьи/сценарии редактируются из админки). Через атрибуты
 * доходят только строки, поэтому данные для компонентов передаём JSON-строкой:
 *
 *   <StatGrid items='[{"value":"50%","label":"доля"}]' />
 *
 * Хелпер принимает и строку, и уже готовый массив (на случай использования из TSX).
 */
export function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

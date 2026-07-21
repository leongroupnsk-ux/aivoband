<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## MDX: выражения в атрибутах не исполняются

В этой сборке JSX-выражения в атрибутах MDX (`items={[...]}`) **молча отбрасываются** —
до компонента доходят только строковые атрибуты. Проверено эмпирически: `unit="x"` приходит,
`items={[...]}` — нет (при этом сам `@mdx-js/mdx compile` выдаёт корректный код, режет рендер).

Поэтому данные в MDX-компоненты передаём JSON-строкой:

```mdx
<StatGrid items='[{"value":"50%","label":"доля"}]' />
```

Компоненты в `src/components/mdx/` разбирают такие props через `asArray()` из `src/lib/mdx-props.ts`.
Это заодно безопаснее: статьи и сценарии редактируются из админки, а MDX-выражение — произвольный код.

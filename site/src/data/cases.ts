// Кейсы — плейсхолдеры этапа 4. Реальные кейсы с цифрами — от заказчика (этап 6, ТЗ §15).

export interface CaseStudy {
  slug: string;
  niche: string;
  solutionSlug: string;
  solutionName: string;
  metric: string;
  title: string;
  context: string;
  challenge: string;
  approach: string;
  tech: string[];
  results: { label: string; before: string; after: string }[];
  nda: boolean;
}

export const cases: CaseStudy[] = [
  {
    slug: "ecommerce-podderzhka",
    niche: "E-commerce",
    solutionSlug: "assistant",
    solutionName: "Умный ассистент",
    metric: "−70% нагрузки на операторов",
    title: "Ассистент поддержки для интернет-магазина [обезличено, NDA]",
    context: "[Плейсхолдер] Магазин с потоком 4 000+ обращений в месяц: статусы заказов, доставка, возвраты.",
    challenge: "[Плейсхолдер] Пиковые нагрузки в сезон, ночные обращения без ответа, выгорание операторов.",
    approach: "[Плейсхолдер] RAG-ассистент на базе регламентов и FAQ, интеграция со статусами заказов, эскалация на оператора.",
    tech: ["RAG", "LLM API", "Telegram", "CRM-интеграция"],
    results: [
      { label: "Обращений закрывает бот", before: "0%", after: "[70%]" },
      { label: "Среднее время ответа", before: "[20 мин]", after: "[15 сек]" },
    ],
    nda: true,
  },
  {
    slug: "online-school-sales",
    niche: "Онлайн-школа",
    solutionSlug: "sales-bot",
    solutionName: "ИИ-продажник",
    metric: "+[X]% конверсии в оплату",
    title: "ИИ-менеджер по продажам для онлайн-школы [обезличено, NDA]",
    context: "[Плейсхолдер] Школа с входящим потоком заявок с рекламы, менеджеры не успевали отвечать вечером.",
    challenge: "[Плейсхолдер] Лиды остывали за ночь, до 40% заявок оставались без первого касания в течение часа.",
    approach: "[Плейсхолдер] ИИ-продажник: мгновенный первый контакт, квалификация, ответы на возражения, передача горячих лидов.",
    tech: ["LLM API", "CRM", "WhatsApp/Telegram", "скоринг"],
    results: [
      { label: "Первое касание", before: "[до 8 часов]", after: "[секунды]" },
      { label: "Конверсия в оплату", before: "[X%]", after: "[X+Y%]" },
    ],
    nda: true,
  },
];

export function getCase(slug: string): CaseStudy | undefined {
  return cases.find((c) => c.slug === slug);
}

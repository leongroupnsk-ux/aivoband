import { NextRequest, NextResponse } from "next/server";
import { addLead } from "@/lib/leads";

/** Строка источника кампании для Telegram-уведомления. */
function utmLine(u: Record<string, string>): string | undefined {
  const parts = [u.utm_source, u.utm_medium, u.utm_campaign].filter(Boolean);
  if (parts.length) return `Кампания: ${parts.join(" / ")}`;
  if (u.referrer) return `Переход с: ${u.referrer}`;
  return undefined;
}

/** Оставляем только ожидаемые ключи UTM и режем длину — данные приходят от клиента. */
function sanitizeUtm(raw: unknown): Record<string, string> | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const allowed = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "landing", "referrer"];
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (allowed.includes(k) && typeof v === "string" && v) out[k] = v.slice(0, 200);
  }
  return Object.keys(out).length ? out : undefined;
}

/**
 * Приём заявок (ТЗ §9): honeypot + rate-limit, отправка в Telegram.
 * Ключи — только на сервере (ТЗ §12): TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID в env
 * (см. .env.example). Без них заявка логируется — сайт работает и до передачи токенов.
 */

const hits = new Map<string, { count: number; ts: number }>();
const WINDOW_MS = 60_000;
const LIMIT = 5;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now - rec.ts > WINDOW_MS) {
    hits.set(ip, { count: 1, ts: now });
    return false;
  }
  rec.count += 1;
  return rec.count > LIMIT;
}

interface LeadPayload {
  name: string;
  contact: string;
  solution: string;
  message: string;
  source: string;
  at: string;
  utm?: Record<string, string>;
}

async function sendTelegram(lead: LeadPayload): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  const text = [
    "🔔 Новая заявка с сайта Aivo",
    `Имя: ${lead.name}`,
    `Контакт: ${lead.contact}`,
    lead.solution && `Решение: ${lead.solution}`,
    lead.message && `Сообщение: ${lead.message}`,
    `Страница: ${lead.source}`,
    lead.utm && utmLine(lead.utm),
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  return res.ok;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.name?.trim() || !body?.contact?.trim()) {
    return NextResponse.json({ error: "name and contact are required" }, { status: 400 });
  }
  // honeypot: боты заполняют скрытое поле — отвечаем 200, но не обрабатываем
  if (body.company_website) {
    return NextResponse.json({ ok: true });
  }

  const lead = {
    name: String(body.name).slice(0, 200),
    contact: String(body.contact).slice(0, 200),
    solution: String(body.solution ?? "").slice(0, 50),
    message: String(body.message ?? "").slice(0, 2000),
    source: String(body.source ?? "form").slice(0, 50),
    at: new Date().toISOString(),
    utm: sanitizeUtm(body.utm),
  };

  // сохраняем в хранилище (админка) — заявка не теряется, даже если Telegram недоступен
  try {
    addLead(lead);
  } catch (e) {
    console.error("[lead:store-error]", e);
  }

  try {
    const delivered = await sendTelegram(lead);
    if (!delivered) {
      // канал не настроен или недоступен — фиксируем в логах хостинга,
      // чтобы заявка не потерялась (дубль в CRM/email — при передаче доступов)
      console.log("[lead:fallback]", JSON.stringify(lead));
    }
  } catch (e) {
    console.error("[lead:telegram-error]", e);
    console.log("[lead:fallback]", JSON.stringify(lead));
  }

  return NextResponse.json({ ok: true });
}

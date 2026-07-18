import { NextRequest, NextResponse } from "next/server";
import { checkPassword, makeSession, SESSION_COOKIE } from "@/lib/auth";

// Простейший rate-limit против перебора пароля
const hits = new Map<string, { count: number; ts: number }>();
function limited(ip: string): boolean {
  const now = Date.now();
  const r = hits.get(ip);
  if (!r || now - r.ts > 60_000) {
    hits.set(ip, { count: 1, ts: now });
    return false;
  }
  r.count += 1;
  return r.count > 10;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (limited(ip)) return NextResponse.json({ error: "too_many" }, { status: 429 });

  const body = await req.json().catch(() => null);
  if (!body?.password || !checkPassword(String(body.password))) {
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, makeSession(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14, // 14 дней
  });
  return res;
}

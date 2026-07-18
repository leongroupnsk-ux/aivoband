import crypto from "node:crypto";
import { cookies } from "next/headers";

/**
 * Простая авторизация одного админа (бэклог П1). Пароль — в env ADMIN_PASSWORD,
 * сессия — подписанная HMAC-кука (httpOnly). Без внешних зависимостей.
 */

const COOKIE = "aivo_admin";
const secret = () => process.env.ADMIN_SECRET ?? "dev-insecure-secret-change-me";

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

/** Значение сессионной куки для валидного входа. */
export function makeSession(): string {
  const payload = "admin";
  return `${payload}.${sign(payload)}`;
}

export function verifySession(value: string | undefined): boolean {
  if (!value) return false;
  const [payload, mac] = value.split(".");
  if (!payload || !mac) return false;
  const expected = sign(payload);
  // сравнение постоянного времени
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function checkPassword(input: string): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(pw);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** true, если текущий запрос авторизован (для server-компонентов). */
export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  return verifySession(store.get(COOKIE)?.value);
}

export const SESSION_COOKIE = COOKIE;

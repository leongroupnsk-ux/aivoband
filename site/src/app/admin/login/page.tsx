"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(res.status === 429 ? "Слишком много попыток, подождите минуту" : "Неверный пароль");
      }
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <form onSubmit={onSubmit} className="card-n w-full max-w-sm">
        <h1 className="font-display text-2xl font-semibold">Админка Aivo</h1>
        <p className="mt-2 text-sm text-subtle">Вход для менеджера</p>
        <input
          type="password"
          className="field mt-6"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        {error && <p className="mt-2 text-sm text-error">{error}</p>}
        <button type="submit" className="btn btn-primary mt-4 w-full" disabled={loading}>
          {loading ? "Входим…" : "Войти"}
        </button>
      </form>
    </div>
  );
}

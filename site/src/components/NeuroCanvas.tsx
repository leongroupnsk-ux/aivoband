"use client";

import { useEffect, useRef } from "react";

/**
 * Hero-визуал (ТЗ §6, «лёгкий вариант»): canvas-граф нейро-узлов,
 * частицы тянутся к курсору. Пауза вне вьюпорта, отключение при reduced-motion.
 */
export default function NeuroCanvas({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(devicePixelRatio, 2);
    let W = 0;
    let H = 0;
    let pts: { x: number; y: number; vx: number; vy: number }[] = [];
    const mouse = { x: -1e4, y: -1e4 };
    let raf = 0;
    let visible = true;

    const resize = () => {
      // Во время смены размеров (поворот экрана, скрытая вкладка) элемент может
      // на мгновение отдать нулевую ширину. Без этой проверки холст навсегда
      // остаётся нулевым и сцена молча пропадает — повторяем на следующем кадре.
      if (cv.offsetWidth === 0 || cv.offsetHeight === 0) {
        requestAnimationFrame(resize);
        return;
      }
      W = cv.width = cv.offsetWidth * dpr;
      H = cv.height = cv.offsetHeight * dpr;
      const n = Math.min(90, Math.floor((W * H) / 28000 / dpr));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25 * dpr,
        vy: (Math.random() - 0.5) * 0.25 * dpr,
      }));
    };

    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) * dpr;
      mouse.y = (e.clientY - r.top) * dpr;
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      ctx.clearRect(0, 0, W, H);
      const R = 170 * dpr;
      for (const p of pts) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const d = Math.hypot(dx, dy);
        if (d < R && d > 1) {
          p.vx += (dx / d) * 0.012 * dpr;
          p.vy += (dy / d) * 0.012 * dpr;
        }
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      }
      const max = 130 * dpr;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i];
          const b = pts[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < max) {
            ctx.strokeStyle = `rgba(120,120,240,${(1 - d / max) * 0.35})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (const p of pts) {
        ctx.fillStyle = "rgba(165,180,252,.85)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.8 * dpr, 0, 7);
        ctx.fill();
      }
    };

    const io = new IntersectionObserver((es) => {
      const nowVisible = es[0].isIntersecting;
      if (nowVisible && !visible) loop();
      if (!nowVisible) cancelAnimationFrame(raf);
      visible = nowVisible;
    });

    // старт после простоя главного потока — сцена не конкурирует с гидрацией (TBT)
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      resize();
      loop();
      io.observe(cv);
      addEventListener("resize", resize);
      addEventListener("pointermove", onMove);
    };
    const idleId =
      "requestIdleCallback" in window
        ? requestIdleCallback(start, { timeout: 1500 })
        : (setTimeout(start, 300) as unknown as number);

    return () => {
      if ("cancelIdleCallback" in window) cancelIdleCallback(idleId);
      else clearTimeout(idleId);
      cancelAnimationFrame(raf);
      io.disconnect();
      removeEventListener("resize", resize);
      removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}

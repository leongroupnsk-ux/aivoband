import { ImageResponse } from "next/og";

// OG-превью по шаблону бренда (ТЗ §10). Текст — латиницей: satori без
// подключённых кириллических шрифтов рендерит кириллицу «тофу»-квадратами.
export const alt = "Aivo — AI systems that don't make things up";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 28,
          background:
            "radial-gradient(700px 400px at 20% 20%, rgba(99,102,241,.35), transparent 60%), radial-gradient(600px 380px at 85% 80%, rgba(236,72,153,.25), transparent 60%), #0D0A22",
          color: "#fff",
          fontSize: 110,
          fontWeight: 700,
        }}
      >
        <svg width="140" height="140" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="7" fill="#A5B4FC" />
          <ellipse
            cx="16" cy="16" rx="14" ry="6.5" fill="none"
            stroke="#EC4899" strokeWidth="1.6" transform="rotate(-24 16 16)"
          />
          <circle cx="27.5" cy="10.5" r="2" fill="#22D3EE" />
        </svg>
        <div style={{ display: "flex" }}>Aivo</div>
        <div style={{ display: "flex", fontSize: 30, fontWeight: 400, color: "#B7B3D8", letterSpacing: 4 }}>
          AI THAT DOESN&apos;T MAKE THINGS UP
        </div>
      </div>
    ),
    size
  );
}

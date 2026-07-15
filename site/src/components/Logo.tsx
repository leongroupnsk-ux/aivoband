export default function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <radialGradient id="lg-core" cx="38%" cy="32%">
          <stop offset="0" stopColor="#C7D2FE" />
          <stop offset=".45" stopColor="#A5B4FC" />
          <stop offset="1" stopColor="#4338CA" />
        </radialGradient>
        <linearGradient id="lg-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6366F1" />
          <stop offset="1" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="7" fill="url(#lg-core)" />
      <ellipse cx="16" cy="16" rx="14" ry="6.5" fill="none" stroke="url(#lg-ring)" strokeWidth="1.6" transform="rotate(-24 16 16)" />
      <circle cx="27.5" cy="10.5" r="2" fill="#22D3EE" />
      <circle cx="5" cy="21.5" r="1.5" fill="#EC4899" />
    </svg>
  );
}

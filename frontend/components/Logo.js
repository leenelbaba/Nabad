const TEAL = "#0f766e";

// The Nabad logo: a pulse icon followed by the name.
// The icon is drawn on a 32x32 grid (the viewBox), then scaled to `size` pixels.
export default function Logo({ size = 36 }) {
  return (
    <a
      href="/"
      style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: TEAL }}
    >
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        {/* Rounded square background: light teal fill, teal border */}
        <rect x="1" y="1" width="30" height="30" rx="8" fill="#f0fdfa" stroke={TEAL} strokeWidth="2" />
        {/* Pulse line: flat, small bump, sharp spike up and down, flat again (like an ECG) */}
        <polyline
          points="5,17 11,17 13,14 15,17 17,7 20,25 22,17 27,17"
          fill="none"
          stroke={TEAL}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <span style={{ fontSize: 24, fontWeight: "bold" }}>Nabad</span>
        <span lang="ar" dir="rtl" style={{ fontSize: 13, marginTop: 2 }}>نبض</span>
      </span>
    </a>
  );
}

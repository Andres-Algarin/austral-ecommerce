import "./BrandLines.css";

type BrandLinesProps = {
  variant?: "subtle" | "hero";
};

/**
 * Motivo de marca: líneas orgánicas tipo hoja, en degradé violeta → menta,
 * inspiradas en la animación del logo. Puramente decorativo (aria-hidden).
 */
function BrandLines({ variant = "subtle" }: BrandLinesProps) {
  const viewBox = variant === "hero" ? "0 0 1200 420" : "0 0 1200 90";
  const gradientId =
    variant === "hero" ? "brandLinesGradientHero" : "brandLinesGradientNav";

  return (
    <svg
      className={`brand-lines brand-lines--${variant}`}
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.9" />
          <stop offset="55%" stopColor="var(--color-primary)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.85" />
        </linearGradient>
      </defs>

      {variant === "hero" ? (
        <>
          <path
            d="M-40,320 C180,260 260,150 420,190 C580,230 620,80 820,60 C960,45 1080,120 1260,40"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="2.5"
          />
          <path
            d="M-40,380 C160,340 300,260 460,300 C640,345 720,180 900,170 C1040,163 1120,240 1260,150"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="1.5"
            opacity="0.7"
          />
          <path
            d="M-40,120 C140,90 220,180 380,140 C540,100 600,220 780,210 C940,202 1020,110 1260,190"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="1.2"
            opacity="0.5"
          />
        </>
      ) : (
        <>
          <path
            d="M-40,70 C180,20 320,80 520,35 C700,-5 820,60 1000,25 C1100,5 1180,45 1260,15"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="1.4"
          />
          <path
            d="M-40,25 C200,60 340,10 540,55 C720,95 840,30 1020,65 C1120,83 1180,50 1260,75"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="1"
            opacity="0.55"
          />
        </>
      )}
    </svg>
  );
}

export default BrandLines;

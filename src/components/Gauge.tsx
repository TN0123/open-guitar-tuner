interface GaugeProps {
  cents: number;
  inTune: boolean;
}

export default function Gauge({ cents, inTune }: GaugeProps) {
  // Map cents (-50 to +50) to angle (-90° to +90°)
  const clampedCents = Math.max(-50, Math.min(50, cents));
  const angle = (clampedCents / 50) * 90;

  const accentColor = inTune ? "var(--color-in-tune)" : "var(--color-accent)";

  return (
    <svg
      viewBox="0 0 300 170"
      style={{ width: "100%", maxWidth: 340 }}
      aria-label={`Tuning gauge: ${cents} cents ${cents < 0 ? "flat" : cents > 0 ? "sharp" : "in tune"}`}
    >
      {/* Arc track */}
      <path
        d="M 30 150 A 120 120 0 0 1 270 150"
        fill="none"
        stroke="var(--color-border)"
        strokeWidth="2"
      />

      {/* Tick marks */}
      {[-50, -25, 0, 25, 50].map((tick) => {
        const tickAngle = (tick / 50) * 90 - 90;
        const rad = (tickAngle * Math.PI) / 180;
        const cx = 150;
        const cy = 150;
        const r1 = 118;
        const r2 = tick === 0 ? 105 : 110;
        const x1 = cx + r1 * Math.cos(rad);
        const y1 = cy + r1 * Math.sin(rad);
        const x2 = cx + r2 * Math.cos(rad);
        const y2 = cy + r2 * Math.sin(rad);
        return (
          <line
            key={tick}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={tick === 0 ? "var(--color-in-tune)" : "var(--color-muted)"}
            strokeWidth={tick === 0 ? 2 : 1}
          />
        );
      })}

      {/* Needle */}
      <line
        x1="150"
        y1="150"
        x2="150"
        y2="35"
        stroke={accentColor}
        strokeWidth="2"
        strokeLinecap="round"
        transform={`rotate(${angle}, 150, 150)`}
        style={{ transition: "transform 0.12s ease-out" }}
      />

      {/* Center pivot */}
      <circle cx="150" cy="150" r="4" fill={accentColor} />
    </svg>
  );
}

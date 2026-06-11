interface RepsChartProps {
  values: number[];
  ariaLabel: string;
}

/** Lightweight hand-rolled SVG bar chart — no chart library, tiny bundle cost. */
export function RepsChart({ values, ariaLabel }: RepsChartProps) {
  if (values.length === 0) return null;

  const W = 100;
  const H = 32;
  const gap = 1.5;
  const n = values.length;
  const barW = (W - gap * (n - 1)) / n;
  const max = Math.max(...values, 1);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={ariaLabel}
      className="h-16 w-full"
    >
      {values.map((v, i) => {
        const h = (v / max) * (H - 2);
        const x = i * (barW + gap);
        const y = H - h;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barW}
            height={h}
            rx={0.6}
            fill="var(--accent)"
            opacity={0.55 + 0.45 * (v / max)}
          />
        );
      })}
    </svg>
  );
}

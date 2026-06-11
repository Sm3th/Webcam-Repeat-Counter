interface RepsChartProps {
  values: number[];
  ariaLabel: string;
}

/**
 * Lightweight mini bar chart — fixed-width bars on a faint track, left-aligned in
 * chronological order. No chart library; looks sensible with any count (a single
 * set is one slim bar, not a giant block).
 */
export function RepsChart({ values, ariaLabel }: RepsChartProps) {
  if (values.length === 0) return null;
  const max = Math.max(...values, 1);

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className="flex h-16 items-end gap-1 overflow-hidden rounded-lg border border-border bg-surface-2 px-2 py-2"
    >
      {values.map((v, i) => (
        <div
          key={i}
          title={String(v)}
          className="w-2.5 shrink-0 rounded-sm bg-accent"
          style={{ height: `${Math.max(10, (v / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

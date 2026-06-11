import type { RepCounterLabels } from '../i18n/labels';

export interface SessionSummary {
  totalReps: number;
  sets: number;
  goodReps: number;
  bestSet: number;
}

interface SessionStatsProps {
  summary: SessionSummary;
  labels: RepCounterLabels;
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-surface-2 px-3 py-3">
      <span className="font-mono text-2xl font-bold text-text">{value}</span>
      <span className="text-center text-[11px] uppercase tracking-wider text-text-dim">
        {label}
      </span>
    </div>
  );
}

export function SessionStats({ summary, labels }: SessionStatsProps) {
  const { totalReps, sets, goodReps, bestSet } = summary;
  const accuracy = totalReps > 0 ? `${Math.round((goodReps / totalReps) * 100)}%` : '—';

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-text-dim">
        {labels.session.title}
      </h2>
      <div className="grid grid-cols-2 gap-2">
        <Stat value={String(totalReps)} label={labels.session.total} />
        <Stat value={String(sets)} label={labels.session.sets} />
        <Stat value={accuracy} label={labels.session.accuracy} />
        <Stat value={String(bestSet)} label={labels.session.best} />
      </div>
    </div>
  );
}

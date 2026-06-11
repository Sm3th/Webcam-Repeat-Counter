import type { CompletedSet } from '../integration/contracts';
import type { RepCounterLabels } from '../i18n/labels';
import { RestTimer } from './RestTimer';

interface SetSummaryProps {
  set: CompletedSet;
  exerciseName: string;
  restSeconds: number;
  labels: RepCounterLabels;
  onClose: () => void;
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-surface-2 px-3 py-3">
      <span className="font-mono text-xl font-bold text-text">{value}</span>
      <span className="text-center text-[11px] uppercase tracking-wider text-text-dim">
        {label}
      </span>
    </div>
  );
}

/** Modal shown when a set completes: key per-set metrics + optional rest timer. */
export function SetSummary({
  set,
  exerciseName,
  restSeconds,
  labels,
  onClose,
}: SetSummaryProps) {
  const accuracy =
    set.reps > 0 ? `${Math.round((set.goodFormReps / set.reps) * 100)}%` : '—';

  const tempos = set.perRep
    .map((r) => r.tempoMs)
    .filter((t): t is number => typeof t === 'number');
  const avgTempo =
    tempos.length > 0
      ? `${(tempos.reduce((a, b) => a + b, 0) / tempos.length / 1000).toFixed(1)}s`
      : '—';

  const roms = set.perRep
    .map((r) => r.romDeg)
    .filter((r): r is number => typeof r === 'number');
  const bestRom = roms.length > 0 ? `${Math.max(...roms)}°` : '—';

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={labels.summary.title}
    >
      <div className="flex w-full max-w-xs flex-col items-center gap-5 rounded-2xl border border-border bg-surface p-6">
        <div className="text-center">
          <h2 className="text-lg font-black text-text">{labels.summary.title}</h2>
          <p className="text-sm text-text-dim">{exerciseName}</p>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="font-mono text-5xl font-bold text-accent">{set.reps}</span>
          <span className="text-xs uppercase tracking-widest text-text-dim">
            {labels.reps}
          </span>
        </div>

        <div className="grid w-full grid-cols-3 gap-2">
          <Stat value={accuracy} label={labels.session.accuracy} />
          <Stat value={avgTempo} label={labels.summary.avgTempo} />
          <Stat value={bestRom} label={labels.summary.bestRom} />
        </div>

        {restSeconds > 0 ? (
          <RestTimer seconds={restSeconds} labels={labels} onDone={onClose} />
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-accent-ink transition-colors hover:bg-accent-dim"
          >
            {labels.summary.close}
          </button>
        )}
      </div>
    </div>
  );
}

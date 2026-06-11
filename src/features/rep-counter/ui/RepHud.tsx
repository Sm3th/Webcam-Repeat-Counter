import type { Phase } from '../engine/types';
import type { RepCounterLabels } from '../i18n/labels';

interface RepHudProps {
  count: number;
  phase: Phase;
  lastRepGoodForm: boolean | null;
  labels: RepCounterLabels;
}

export function RepHud({ count, phase, lastRepGoodForm, labels }: RepHudProps) {
  const phaseText = phase === 'up' ? labels.phaseUp : labels.phaseDown;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="font-mono text-7xl font-bold leading-none text-accent sm:text-8xl"
        aria-live="polite"
        aria-label={`${count} ${labels.reps}`}
      >
        {count}
      </div>
      <div className="text-sm uppercase tracking-widest text-text-dim">{labels.reps}</div>

      <div className="flex items-center gap-2">
        <span
          className="rounded-full border border-border bg-surface-2 px-3 py-1 font-mono text-xs uppercase tracking-wider text-text"
          aria-label={`Phase: ${phaseText}`}
        >
          {phaseText}
        </span>
        {lastRepGoodForm !== null && (
          <span
            className={`rounded-full border bg-surface-2 px-3 py-1 text-xs font-semibold ${
              lastRepGoodForm
                ? 'border-good text-good'
                : 'border-danger text-danger'
            }`}
          >
            {lastRepGoodForm ? labels.goodForm : labels.goLower}
          </span>
        )}
      </div>
    </div>
  );
}

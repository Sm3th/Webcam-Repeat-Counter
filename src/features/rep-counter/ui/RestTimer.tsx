import { useEffect, useState } from 'react';
import type { RepCounterLabels } from '../i18n/labels';

interface RestTimerProps {
  seconds: number;
  labels: RepCounterLabels;
  onDone: () => void;
}

/** Simple rest countdown shown after a set; calls onDone at zero or on skip. */
export function RestTimer({ seconds, labels, onDone }: RestTimerProps) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) {
      onDone();
      return;
    }
    const id = window.setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => window.clearTimeout(id);
  }, [remaining, onDone]);

  const mm = Math.floor(remaining / 60);
  const ss = String(remaining % 60).padStart(2, '0');

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-xs font-semibold uppercase tracking-widest text-text-dim">
        {labels.summary.rest}
      </span>
      <span className="font-mono text-5xl font-bold text-accent" aria-live="polite">
        {mm}:{ss}
      </span>
      <button
        type="button"
        onClick={onDone}
        className="rounded-lg border border-border bg-surface-2 px-4 py-2 text-sm font-semibold text-text transition-colors hover:bg-surface"
      >
        {labels.summary.skip}
      </button>
    </div>
  );
}

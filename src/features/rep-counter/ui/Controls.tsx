import type { RepCounterLabels } from '../i18n/labels';

interface ControlsProps {
  running: boolean;
  onToggle: () => void;
  onReset: () => void;
  labels: RepCounterLabels;
}

export function Controls({ running, onToggle, onReset, labels }: ControlsProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onToggle}
        className="rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-accent-ink transition-colors hover:bg-accent-dim"
      >
        {running ? labels.stop : labels.start}
      </button>
      <button
        type="button"
        onClick={onReset}
        className="rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-text transition-colors hover:bg-surface-2"
      >
        {labels.reset}
      </button>
    </div>
  );
}

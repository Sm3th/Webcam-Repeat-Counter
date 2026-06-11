import type { RepCounterLabels } from '../i18n/labels';

export type RepCounterErrorKind =
  | 'denied'
  | 'nocamera'
  | 'inuse'
  | 'insecure'
  | 'model';

interface ErrorPanelProps {
  kind: RepCounterErrorKind;
  onRetry: () => void;
  labels: RepCounterLabels;
}

export function ErrorPanel({ kind, onRetry, labels }: ErrorPanelProps) {
  const message = labels.errors[kind];
  return (
    <div
      role="alert"
      className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-4 rounded-xl border border-border bg-surface p-6 text-center"
    >
      <div className="max-w-sm text-sm text-text">{message}</div>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-accent-ink transition-colors hover:bg-accent-dim"
      >
        {labels.errors.retry}
      </button>
    </div>
  );
}

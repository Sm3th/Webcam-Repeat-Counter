import type { RepCounterLabels } from '../i18n/labels';

interface StatusBarProps {
  fps: number;
  inFrame: boolean;
  labels: RepCounterLabels;
}

export function StatusBar({ fps, inFrame, labels }: StatusBarProps) {
  return (
    <div className="flex flex-col gap-2 text-xs text-text-dim">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="font-mono">
          {Math.round(fps)} {labels.fps}
        </span>
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className={`inline-block h-2 w-2 rounded-full ${
              inFrame ? 'bg-good' : 'bg-danger'
            }`}
          />
          {inFrame ? labels.inFrame : labels.moveIntoFrame}
        </span>
      </div>
      <p className="text-text-dim">{labels.privacy}</p>
    </div>
  );
}

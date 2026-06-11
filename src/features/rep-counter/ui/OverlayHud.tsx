import type { Phase } from '../engine/types';
import type { RepCounterLabels } from '../i18n/labels';

interface OverlayHudProps {
  exerciseName: string;
  count: number;
  phase: Phase;
  lastRepGoodForm: boolean | null;
  inFrame: boolean;
  running: boolean;
  labels: RepCounterLabels;
}

/** Compact HUD painted over the camera; stays visible in fullscreen. */
export function OverlayHud({
  exerciseName,
  count,
  phase,
  lastRepGoodForm,
  inFrame,
  running,
  labels,
}: OverlayHudProps) {
  if (!running) return null;

  return (
    <div className="flex h-full flex-col justify-between bg-gradient-to-b from-black/40 via-transparent to-black/50 p-4">
      <div className="flex items-center gap-2">
        <span className="rc-overlay-shadow rounded-full bg-black/45 px-3 py-1 text-xs font-bold uppercase tracking-wider text-text backdrop-blur">
          {exerciseName}
        </span>
        <span className="rc-overlay-shadow flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-xs text-text backdrop-blur">
          <span
            aria-hidden="true"
            className={`inline-block h-2 w-2 rounded-full ${
              inFrame ? 'bg-good' : 'bg-danger'
            }`}
          />
          {inFrame ? labels.inFrame : labels.moveIntoFrame}
        </span>
      </div>

      <div className="flex items-end justify-between">
        <div className="rc-overlay-shadow flex items-baseline gap-2">
          <span className="rc-glow font-mono text-6xl font-bold leading-none text-accent">
            {count}
          </span>
          <span className="text-xs uppercase tracking-widest text-text-dim">
            {labels.reps}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="rc-overlay-shadow rounded-full bg-black/45 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-text backdrop-blur">
            {phase === 'up' ? labels.phaseUp : labels.phaseDown}
          </span>
          {lastRepGoodForm !== null && (
            <span
              className={`rc-overlay-shadow rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-semibold backdrop-blur ${
                lastRepGoodForm ? 'text-good' : 'text-danger'
              }`}
            >
              {lastRepGoodForm ? labels.goodForm : labels.goLower}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

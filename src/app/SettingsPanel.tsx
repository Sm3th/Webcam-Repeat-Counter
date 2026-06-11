import { useEffect, useRef, useState } from 'react';
import type { RepCounterLabels } from '../features/rep-counter';
import type { Prefs } from './usePrefs';

interface SettingsPanelProps {
  prefs: Prefs;
  onChange: (patch: Partial<Prefs>) => void;
  labels: RepCounterLabels;
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-1.5 text-sm text-text">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-10 rounded-full border border-border transition-colors ${
          checked ? 'bg-accent' : 'bg-surface-2'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-bg transition-transform ${
            checked ? 'left-0.5 translate-x-4' : 'left-0.5'
          }`}
        />
      </button>
    </label>
  );
}

/** Gear button + dropdown holding the standalone host's preferences. */
export function SettingsPanel({ prefs, onChange, labels }: SettingsPanelProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={labels.settings.title}
        aria-expanded={open}
        className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface text-text-dim transition-colors hover:text-accent"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
          <path
            d="M19.4 13a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.2.62.78 1.05 1.51 1.05H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-64 rounded-xl border border-border bg-surface p-4 shadow-xl">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-text-dim">
            {labels.settings.title}
          </h2>

          <div className="mb-3">
            <span className="mb-1.5 block text-sm text-text">{labels.settings.model}</span>
            <div className="inline-flex w-full rounded-lg border border-border bg-surface-2 p-1">
              {(['lightning', 'thunder'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onChange({ modelType: m })}
                  aria-pressed={prefs.modelType === m}
                  className={`flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition-colors ${
                    prefs.modelType === m
                      ? 'bg-accent text-accent-ink'
                      : 'text-text-dim hover:text-text'
                  }`}
                >
                  {m === 'lightning' ? labels.settings.fast : labels.settings.accurate}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-border">
            <Toggle
              checked={prefs.sound}
              onChange={(v) => onChange({ sound: v })}
              label={labels.settings.sound}
            />
            <Toggle
              checked={prefs.voice}
              onChange={(v) => onChange({ voice: v })}
              label={labels.settings.voice}
            />
          </div>

          <label className="mt-3 flex items-center justify-between gap-3 text-sm text-text">
            <span>{labels.settings.rest}</span>
            <input
              type="number"
              min={0}
              max={300}
              step={15}
              value={prefs.restSeconds}
              onChange={(e) =>
                onChange({ restSeconds: Math.max(0, Number(e.target.value) || 0) })
              }
              className="w-16 rounded-lg border border-border bg-surface-2 px-2 py-1 text-right font-mono text-text outline-none focus:border-accent"
            />
          </label>
        </div>
      )}
    </div>
  );
}

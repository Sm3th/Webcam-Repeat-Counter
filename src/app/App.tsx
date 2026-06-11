import { useMemo, useState } from 'react';
import {
  RepCounter,
  EXERCISES,
  EN,
  TR,
  PL,
  type ExerciseConfig,
  type RepCounterLabels,
} from '../features/rep-counter';
import { ExercisePicker } from '../features/rep-counter/ui/ExercisePicker';
import { createLocalStorageSink } from '../features/rep-counter/integration/localStorageSink';
import { InstallButton } from './InstallButton';

type Lang = 'en' | 'tr' | 'pl';
const PACKS: Record<Lang, RepCounterLabels> = { en: EN, tr: TR, pl: PL };
const LANGS: Array<{ code: Lang; flag: string; label: string }> = [
  { code: 'en', flag: '🇬🇧', label: 'EN' },
  { code: 'tr', flag: '🇹🇷', label: 'TR' },
  { code: 'pl', flag: '🇵🇱', label: 'PL' },
];

const EXERCISE_LIST = Object.values(EXERCISES);

export function App() {
  const [exercise, setExercise] = useState<ExerciseConfig>(EXERCISES.pushup);
  const [lang, setLang] = useState<Lang>('en');
  const labels = PACKS[lang];

  // Standalone persistence: completed sets land in localStorage.
  const sink = useMemo(() => createLocalStorageSink(), []);

  return (
    <div className="rc-theme-standalone relative min-h-full overflow-hidden bg-bg text-text">
      {/* Decorative lime glow behind the header. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-32 h-80"
        style={{
          background:
            'radial-gradient(60% 60% at 50% 0%, rgba(198,244,50,0.14), transparent 70%)',
        }}
      />
      <div className="relative mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-surface text-accent"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <rect x="5" y="10.5" width="14" height="3" rx="1" />
                <rect x="3" y="7" width="3" height="10" rx="1" />
                <rect x="18" y="7" width="3" height="10" rx="1" />
              </svg>
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Rep<span className="text-accent">Counter</span>
              </h1>
              <p className="text-sm text-text-dim">
                Real-time calisthenics reps from your webcam — on device.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <InstallButton label={labels.install} />
            <div
              role="radiogroup"
              aria-label="Language"
              className="inline-flex rounded-lg border border-border bg-surface p-1"
            >
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  role="radio"
                  aria-checked={lang === l.code}
                  onClick={() => setLang(l.code)}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    lang === l.code ? 'bg-accent text-bg' : 'text-text-dim hover:text-text'
                  }`}
                >
                  <span aria-hidden="true">{l.flag}</span> {l.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        <ExercisePicker
          exercises={EXERCISE_LIST}
          selectedId={exercise.id}
          onSelect={setExercise}
          labels={labels}
        />

        <RepCounter
          exercise={exercise}
          active={true}
          labels={labels}
          theme="standalone"
          sink={sink}
        />
      </div>
    </div>
  );
}

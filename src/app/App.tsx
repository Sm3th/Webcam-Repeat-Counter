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
import { SettingsPanel } from './SettingsPanel';
import { usePrefs } from './usePrefs';
import { HistoryView } from './HistoryView';

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
  const [light, setLight] = useState(false);
  const [view, setView] = useState<'train' | 'history'>('train');
  const [prefs, setPrefs] = usePrefs();
  const labels = PACKS[lang];
  const exerciseName = (id: string): string =>
    (labels.exercises as Record<string, string>)[id] ?? id;

  // Standalone persistence: completed sets land in localStorage.
  const sink = useMemo(() => createLocalStorageSink(), []);

  return (
    <div
      className={`rc-theme-standalone rc-hero relative min-h-full bg-bg text-text ${
        light ? 'light' : ''
      }`}
    >
      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 md:px-6 md:py-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="rc-elevated grid h-11 w-11 place-items-center rounded-2xl border border-border bg-surface text-accent"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <rect x="5" y="10.5" width="14" height="3" rx="1" />
                <rect x="3" y="7" width="3" height="10" rx="1" />
                <rect x="18" y="7" width="3" height="10" rx="1" />
              </svg>
            </span>
            <div>
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                Rep<span className="text-accent">Counter</span>
              </h1>
              <p className="text-sm text-text-dim">
                Real-time calisthenics reps from your webcam — on device.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <InstallButton label={labels.install} />

            <SettingsPanel prefs={prefs} onChange={setPrefs} labels={labels} />

            <button
              type="button"
              onClick={() => setLight((v) => !v)}
              aria-label="Toggle light / dark theme"
              aria-pressed={light}
              className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface text-text-dim transition-colors hover:text-accent"
            >
              {light ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
                  </g>
                </svg>
              )}
            </button>

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
                    lang === l.code
                      ? 'bg-accent text-accent-ink'
                      : 'text-text-dim hover:text-text'
                  }`}
                >
                  <span aria-hidden="true">{l.flag}</span> {l.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        <nav
          role="tablist"
          aria-label="View"
          className="inline-flex self-start rounded-lg border border-border bg-surface p-1"
        >
          {(['train', 'history'] as const).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
                view === v ? 'bg-accent text-accent-ink' : 'text-text-dim hover:text-text'
              }`}
            >
              {labels.nav[v]}
            </button>
          ))}
        </nav>

        {view === 'train' ? (
          <>
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
              modelType={prefs.modelType}
              sound={prefs.sound}
              voice={prefs.voice}
              restSeconds={prefs.restSeconds}
              sink={sink}
            />
          </>
        ) : (
          <HistoryView labels={labels} exerciseName={exerciseName} />
        )}
      </div>
    </div>
  );
}

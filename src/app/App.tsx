import { useEffect, useMemo, useState } from 'react';
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
import { LanguageMenu } from './LanguageMenu';

type Lang = 'en' | 'tr' | 'pl';
const PACKS: Record<Lang, RepCounterLabels> = { en: EN, tr: TR, pl: PL };
const LANGS: Array<{ code: Lang; flag: string; label: string }> = [
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'tr', flag: '🇹🇷', label: 'Türkçe' },
  { code: 'pl', flag: '🇵🇱', label: 'Polski' },
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

  // Mirror the theme onto <body> so the page background (and overscroll area)
  // follows light/dark, not just the app wrapper.
  useEffect(() => {
    document.body.classList.add('rc-theme-standalone');
    document.body.classList.toggle('light', light);
    return () => {
      document.body.classList.remove('rc-theme-standalone', 'light');
    };
  }, [light]);

  return (
    <div
      className={`rc-theme-standalone rc-hero relative min-h-screen text-text ${
        light ? 'light' : ''
      }`}
    >
      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 md:px-6 md:py-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              aria-label="FitTrack"
              className="rc-elevated grid h-11 w-11 place-items-center rounded-2xl bg-accent text-accent-ink"
            >
              {/* FitTrack chevron mark */}
              <svg width="24" height="24" viewBox="0 0 100 100" fill="none" aria-hidden="true">
                <line
                  x1="14"
                  y1="76"
                  x2="50"
                  y2="22"
                  stroke="currentColor"
                  strokeWidth="11"
                  strokeLinecap="round"
                />
                <line
                  x1="50"
                  y1="22"
                  x2="86"
                  y2="76"
                  stroke="currentColor"
                  strokeWidth="11"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <div>
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                F<span className="text-accent">i</span>tTrack{' '}
                <span className="text-text-dim">Reps</span>
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

            <LanguageMenu
              langs={LANGS}
              current={lang}
              onChange={(c) => setLang(c as Lang)}
            />
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

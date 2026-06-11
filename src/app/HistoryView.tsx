import { useMemo } from 'react';
import type { CompletedSet, RepCounterLabels } from '../features/rep-counter';
import { readSavedSets } from '../features/rep-counter/integration/localStorageSink';
import { RepsChart } from './RepsChart';

interface HistoryViewProps {
  labels: RepCounterLabels;
  exerciseName: (id: string) => string;
}

interface ExerciseAgg {
  id: string;
  sets: number;
  totalReps: number;
  bestSet: number;
  recent: number[]; // reps per set, chronological
}

function aggregate(sets: CompletedSet[]): ExerciseAgg[] {
  const byId = new Map<string, ExerciseAgg>();
  for (const s of sets) {
    let agg = byId.get(s.exerciseId);
    if (!agg) {
      agg = { id: s.exerciseId, sets: 0, totalReps: 0, bestSet: 0, recent: [] };
      byId.set(s.exerciseId, agg);
    }
    agg.sets += 1;
    agg.totalReps += s.reps;
    agg.bestSet = Math.max(agg.bestSet, s.reps);
    agg.recent.push(s.reps);
  }
  for (const agg of byId.values()) agg.recent = agg.recent.slice(-24);
  return [...byId.values()].sort((a, b) => b.totalReps - a.totalReps);
}

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCsv(sets: CompletedSet[]): string {
  const header = 'exerciseId,reps,goodFormReps,startedAt,endedAt,durationMs';
  const rows = sets.map((s) =>
    [
      s.exerciseId,
      s.reps,
      s.goodFormReps,
      new Date(s.startedAt).toISOString(),
      new Date(s.endedAt).toISOString(),
      s.durationMs,
    ].join(','),
  );
  return [header, ...rows].join('\n');
}

export function HistoryView({ labels, exerciseName }: HistoryViewProps) {
  const sets = useMemo(() => readSavedSets(), []);
  const aggs = useMemo(() => aggregate(sets), [sets]);

  if (sets.length === 0) {
    return (
      <div className="rc-elevated flex min-h-[40vh] items-center justify-center rounded-2xl border border-border bg-surface p-8 text-center text-sm text-text-dim">
        {labels.history.empty}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">{labels.history.title}</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              download('rep-counter-history.json', JSON.stringify(sets, null, 2), 'application/json')
            }
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text transition-colors hover:bg-surface-2"
          >
            {labels.history.exportJson}
          </button>
          <button
            type="button"
            onClick={() => download('rep-counter-history.csv', toCsv(sets), 'text/csv')}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text transition-colors hover:bg-surface-2"
          >
            {labels.history.exportCsv}
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {aggs.map((agg) => (
          <div
            key={agg.id}
            className="rc-elevated flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5"
          >
            <h3 className="text-base font-bold">{exerciseName(agg.id)}</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="font-mono text-2xl font-bold text-accent">{agg.bestSet}</div>
                <div className="text-[11px] uppercase tracking-wider text-text-dim">
                  {labels.history.bestSet}
                </div>
              </div>
              <div>
                <div className="font-mono text-2xl font-bold text-text">{agg.totalReps}</div>
                <div className="text-[11px] uppercase tracking-wider text-text-dim">
                  {labels.history.volume}
                </div>
              </div>
              <div>
                <div className="font-mono text-2xl font-bold text-text">{agg.sets}</div>
                <div className="text-[11px] uppercase tracking-wider text-text-dim">
                  {labels.history.sets}
                </div>
              </div>
            </div>
            <RepsChart
              values={agg.recent}
              ariaLabel={`${exerciseName(agg.id)} — ${labels.history.volume}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

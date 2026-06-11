import type { ExerciseConfig, ExerciseId } from '../engine/exercises';
import type { RepCounterLabels } from '../i18n/labels';

interface ExercisePickerProps {
  exercises: ExerciseConfig[];
  selectedId: string;
  onSelect: (exercise: ExerciseConfig) => void;
  labels: RepCounterLabels;
  disabled?: boolean;
}

export function ExercisePicker({
  exercises,
  selectedId,
  onSelect,
  labels,
  disabled,
}: ExercisePickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Exercise"
      className="flex flex-wrap gap-1 rounded-lg border border-border bg-surface p-1"
    >
      {exercises.map((ex) => {
        const selected = ex.id === selectedId;
        const name = labels.exercises[ex.id as ExerciseId] ?? ex.label;
        return (
          <button
            key={ex.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onSelect(ex)}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
              selected
                ? 'bg-accent text-bg'
                : 'text-text-dim hover:text-text'
            }`}
          >
            {name}
          </button>
        );
      })}
    </div>
  );
}

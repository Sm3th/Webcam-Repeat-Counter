import type { ReactNode } from 'react';
import type { ExerciseConfig } from '../engine/exercises';
import type { RepCounterLabels } from '../i18n/labels';

export interface RepEvent {
  exerciseId: string; // host's stable id (a FitTrack library id when embedded)
  index: number; // 1-based rep number within the current set
  goodForm: boolean | null;
  at: number; // epoch ms
}

export interface CompletedSet {
  exerciseId: string;
  reps: number;
  goodFormReps: number;
  startedAt: number;
  endedAt: number;
  durationMs: number;
  perRep: Array<{ goodForm: boolean | null; at: number }>;
}

/** Persistence boundary. Standalone uses localStorage; FitTrack injects an API / IndexedDB-queue impl. */
export interface RepSessionSink {
  saveSet(set: CompletedSet): Promise<void> | void;
}

export interface RepCounterProps {
  /** Detection profile. A built-in from EXERCISES, or a custom one mapped from a host exercise. */
  exercise: ExerciseConfig;
  /** Host's stable id for this exercise (e.g. a FitTrack library id). Defaults to exercise.id. */
  exerciseId?: string;
  /** Camera lifecycle: true = run; false = stop & release. */
  active: boolean;
  /** Injected i18n strings; defaults to EN. */
  labels?: RepCounterLabels;
  /** 'inherit' consumes the host's CSS theme vars; 'standalone' applies the bundled tokens. */
  theme?: 'inherit' | 'standalone';
  /** Where finished sets go. Optional in standalone. */
  sink?: RepSessionSink;
  onRep?: (e: RepEvent) => void;
  onSetComplete?: (set: CompletedSet) => void;
  /** Optional slot for host chrome (e.g. FitTrack's own header/footer). */
  children?: ReactNode;
}

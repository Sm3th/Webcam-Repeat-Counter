import type { KeypointName } from './types';
import type { RepCounterConfig } from './repCounter';

export type ExerciseId = 'pushup' | 'squat' | 'pullup';

export interface ExerciseConfig extends RepCounterConfig {
  id: ExerciseId;
  label: string;
  leftTriplet: [KeypointName, KeypointName, KeypointName];
  rightTriplet: [KeypointName, KeypointName, KeypointName];
  smoothingAlpha: number;
  minKeypointScore: number;
  hint: string;
}

export const EXERCISES: Record<ExerciseId, ExerciseConfig> = {
  pushup: {
    id: 'pushup',
    label: 'Push-ups',
    leftTriplet: ['left_shoulder', 'left_elbow', 'left_wrist'],
    rightTriplet: ['right_shoulder', 'right_elbow', 'right_wrist'],
    downEnter: 95,
    upEnter: 155,
    minRepMs: 500,
    targetDepth: 90,
    smoothingAlpha: 0.4,
    minKeypointScore: 0.3,
    hint: 'Side-on to the camera, whole body in frame.',
  },
  squat: {
    id: 'squat',
    label: 'Squats',
    leftTriplet: ['left_hip', 'left_knee', 'left_ankle'],
    rightTriplet: ['right_hip', 'right_knee', 'right_ankle'],
    downEnter: 110,
    upEnter: 160,
    minRepMs: 600,
    targetDepth: 100,
    smoothingAlpha: 0.4,
    minKeypointScore: 0.3,
    hint: 'Stand side-on, full body visible head to feet.',
  },
  pullup: {
    id: 'pullup',
    label: 'Pull-ups',
    leftTriplet: ['left_shoulder', 'left_elbow', 'left_wrist'],
    rightTriplet: ['right_shoulder', 'right_elbow', 'right_wrist'],
    downEnter: 100,
    upEnter: 150,
    minRepMs: 500,
    targetDepth: 90,
    smoothingAlpha: 0.4,
    minKeypointScore: 0.3,
    hint: 'Face the camera, arms and torso in frame.',
  },
};

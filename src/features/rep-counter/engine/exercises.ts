import type { KeypointName, Orientation } from './types';
import type { RepCounterConfig } from './repCounter';

export type ExerciseId =
  | 'pushup'
  | 'squat'
  | 'pullup'
  | 'curl'
  | 'lunge'
  | 'situp'
  | 'ohp';

export interface ExerciseConfig extends RepCounterConfig {
  id: ExerciseId;
  label: string;
  leftTriplet: [KeypointName, KeypointName, KeypointName];
  rightTriplet: [KeypointName, KeypointName, KeypointName];
  smoothingAlpha: number;
  minKeypointScore: number;
  orientation: Orientation;
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
    orientation: 'side',
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
    orientation: 'side',
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
    orientation: 'front',
    hint: 'Face the camera, arms and torso in frame.',
  },
  curl: {
    id: 'curl',
    label: 'Biceps Curls',
    leftTriplet: ['left_shoulder', 'left_elbow', 'left_wrist'],
    rightTriplet: ['right_shoulder', 'right_elbow', 'right_wrist'],
    downEnter: 70,
    upEnter: 150,
    minRepMs: 400,
    targetDepth: 55,
    smoothingAlpha: 0.4,
    minKeypointScore: 0.3,
    orientation: 'side',
    hint: 'Side-on, upper arm still — curl through the full range.',
  },
  lunge: {
    id: 'lunge',
    label: 'Lunges',
    leftTriplet: ['left_hip', 'left_knee', 'left_ankle'],
    rightTriplet: ['right_hip', 'right_knee', 'right_ankle'],
    downEnter: 110,
    upEnter: 160,
    minRepMs: 600,
    targetDepth: 100,
    smoothingAlpha: 0.4,
    minKeypointScore: 0.3,
    orientation: 'side',
    hint: 'Side-on, step forward and lower your back knee.',
  },
  situp: {
    id: 'situp',
    label: 'Sit-ups',
    leftTriplet: ['left_shoulder', 'left_hip', 'left_knee'],
    rightTriplet: ['right_shoulder', 'right_hip', 'right_knee'],
    downEnter: 90,
    upEnter: 130,
    minRepMs: 600,
    targetDepth: 80,
    smoothingAlpha: 0.4,
    minKeypointScore: 0.3,
    orientation: 'side',
    hint: 'Side-on, knees bent — curl your torso up toward your knees.',
  },
  ohp: {
    id: 'ohp',
    label: 'Shoulder Press',
    leftTriplet: ['left_shoulder', 'left_elbow', 'left_wrist'],
    rightTriplet: ['right_shoulder', 'right_elbow', 'right_wrist'],
    direction: 'extend',
    downEnter: 95, // returned to racked (elbow bent)
    upEnter: 150, // pressed up past here = rep started
    minRepMs: 500,
    targetDepth: 160, // good form = locked out at/above this
    smoothingAlpha: 0.4,
    minKeypointScore: 0.3,
    orientation: 'front',
    hint: 'Face the camera, press straight overhead to full lockout.',
  },
};

export interface Point {
  x: number;
  y: number;
}

export interface Keypoint extends Point {
  name: KeypointName;
  score: number;
}

export type KeypointName =
  | 'nose'
  | 'left_eye'
  | 'right_eye'
  | 'left_ear'
  | 'right_ear'
  | 'left_shoulder'
  | 'right_shoulder'
  | 'left_elbow'
  | 'right_elbow'
  | 'left_wrist'
  | 'right_wrist'
  | 'left_hip'
  | 'right_hip'
  | 'left_knee'
  | 'right_knee'
  | 'left_ankle'
  | 'right_ankle';

export type Phase = 'up' | 'down';
export type Side = 'left' | 'right';

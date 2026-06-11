import { describe, expect, it } from 'vitest';
import {
  byName,
  pickSide,
  sideScore,
} from '../src/features/rep-counter/engine/keypoints';
import type { Keypoint, KeypointName } from '../src/features/rep-counter/engine/types';

function kp(name: KeypointName, score: number): Keypoint {
  return { name, x: 0, y: 0, score };
}

const LEFT: [KeypointName, KeypointName, KeypointName] = [
  'left_shoulder',
  'left_elbow',
  'left_wrist',
];
const RIGHT: [KeypointName, KeypointName, KeypointName] = [
  'right_shoulder',
  'right_elbow',
  'right_wrist',
];

describe('keypoints', () => {
  it('sideScore returns the minimum score across the triplet', () => {
    const map = byName([
      kp('left_shoulder', 0.9),
      kp('left_elbow', 0.4),
      kp('left_wrist', 0.7),
    ]);
    expect(sideScore(map, LEFT)).toBeCloseTo(0.4);
  });

  it('sideScore returns -Infinity when a joint is missing', () => {
    const map = byName([kp('left_shoulder', 0.9), kp('left_elbow', 0.8)]);
    expect(sideScore(map, LEFT)).toBe(-Infinity);
  });

  it('pickSide selects the side with the higher minimum score', () => {
    const map = byName([
      kp('left_shoulder', 0.9),
      kp('left_elbow', 0.2),
      kp('left_wrist', 0.9),
      kp('right_shoulder', 0.8),
      kp('right_elbow', 0.7),
      kp('right_wrist', 0.85),
    ]);
    const r = pickSide(map, LEFT, RIGHT);
    expect(r.side).toBe('right');
    expect(r.score).toBeCloseTo(0.7);
  });

  it('pickSide returns -Infinity score when a chosen joint is missing on both sides', () => {
    const map = byName([kp('left_shoulder', 0.9), kp('right_shoulder', 0.9)]);
    const r = pickSide(map, LEFT, RIGHT);
    expect(r.score).toBe(-Infinity);
  });
});

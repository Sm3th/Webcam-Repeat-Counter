import type { Keypoint, KeypointName, Orientation, Side } from './types';

export function byName(kps: Keypoint[]): Map<KeypointName, Keypoint> {
  const m = new Map<KeypointName, Keypoint>();
  for (const k of kps) m.set(k.name, k);
  return m;
}

/** Min score across the three joints for a given side. Returns -Infinity if any missing. */
export function sideScore(
  map: Map<KeypointName, Keypoint>,
  triplet: [KeypointName, KeypointName, KeypointName],
): number {
  let min = Infinity;
  for (const name of triplet) {
    const k = map.get(name);
    if (!k) return -Infinity;
    min = Math.min(min, k.score);
  }
  return min;
}

export function pickSide(
  map: Map<KeypointName, Keypoint>,
  left: [KeypointName, KeypointName, KeypointName],
  right: [KeypointName, KeypointName, KeypointName],
): { side: Side; score: number } {
  const ls = sideScore(map, left);
  const rs = sideScore(map, right);
  return rs >= ls ? { side: 'right', score: rs } : { side: 'left', score: ls };
}

/**
 * Rough body orientation from shoulder spread vs torso height. Facing the camera,
 * the shoulders are spread wide relative to the torso; side-on they nearly overlap.
 * Returns null when the needed keypoints aren't present (so callers don't false-warn).
 */
export function estimateOrientation(
  map: Map<KeypointName, Keypoint>,
  minScore = 0.3,
): Orientation | null {
  const ls = map.get('left_shoulder');
  const rs = map.get('right_shoulder');
  if (!ls || !rs || ls.score < minScore || rs.score < minScore) return null;

  const shoulderSpread = Math.abs(ls.x - rs.x);

  // Average torso height from whichever hips are confident.
  let torso = 0;
  let n = 0;
  const lh = map.get('left_hip');
  const rh = map.get('right_hip');
  if (lh && lh.score >= minScore) {
    torso += Math.abs(ls.y - lh.y);
    n += 1;
  }
  if (rh && rh.score >= minScore) {
    torso += Math.abs(rs.y - rh.y);
    n += 1;
  }
  if (n === 0) return null;
  torso /= n;
  if (torso < 1e-3) return null;

  return shoulderSpread / torso > 0.28 ? 'front' : 'side';
}

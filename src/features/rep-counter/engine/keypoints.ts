import type { Keypoint, KeypointName, Side } from './types';

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

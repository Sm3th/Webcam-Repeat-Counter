import type { Point } from './types';

/** Interior angle (degrees, 0–180) at vertex B for points A-B-C. NaN if degenerate. */
export function angleABC(a: Point, b: Point, c: Point): number {
  const abx = a.x - b.x,
    aby = a.y - b.y;
  const cbx = c.x - b.x,
    cby = c.y - b.y;
  const magAB = Math.hypot(abx, aby);
  const magCB = Math.hypot(cbx, cby);
  if (magAB === 0 || magCB === 0) return NaN;
  const dot = abx * cbx + aby * cby;
  let cos = dot / (magAB * magCB);
  cos = Math.min(1, Math.max(-1, cos)); // clamp against float error
  return (Math.acos(cos) * 180) / Math.PI;
}

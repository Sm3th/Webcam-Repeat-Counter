import { describe, expect, it } from 'vitest';
import { angleABC } from '../src/features/rep-counter/engine/angles';

describe('angleABC', () => {
  it('returns ~90 for a right angle', () => {
    // A above B, C to the right of B → 90°.
    const angle = angleABC({ x: 0, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 0 });
    expect(angle).toBeCloseTo(90, 1);
  });

  it('returns ~180 for a straight (collinear, extended) configuration', () => {
    const angle = angleABC({ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 });
    expect(angle).toBeCloseTo(180, 1);
  });

  it('returns ~0 when folded back on itself', () => {
    const angle = angleABC({ x: 1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 });
    expect(angle).toBeCloseTo(0, 1);
  });

  it('returns NaN when the vertex coincides with an endpoint', () => {
    expect(angleABC({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 })).toBeNaN();
    expect(angleABC({ x: 1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 })).toBeNaN();
  });

  it('is invariant under horizontal mirroring', () => {
    const a = { x: 0, y: 1 };
    const b = { x: 0, y: 0 };
    const c = { x: 1, y: 0 };
    const mirror = (p: { x: number; y: number }) => ({ x: -p.x, y: p.y });
    expect(angleABC(a, b, c)).toBeCloseTo(
      angleABC(mirror(a), mirror(b), mirror(c)),
      5,
    );
  });
});

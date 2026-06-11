import { describe, expect, it } from 'vitest';
import { Ema } from '../src/features/rep-counter/engine/smoothing';

describe('Ema', () => {
  it('passes the first value through unchanged', () => {
    const ema = new Ema(0.3);
    expect(ema.next(42)).toBe(42);
    expect(ema.current()).toBe(42);
  });

  it('converges toward a constant input', () => {
    const ema = new Ema(0.5);
    ema.next(0);
    let v = 0;
    for (let i = 0; i < 20; i++) v = ema.next(100);
    expect(v).toBeGreaterThan(99);
    expect(v).toBeLessThanOrEqual(100);
  });

  it('reacts faster with a higher alpha', () => {
    const fast = new Ema(0.9);
    const slow = new Ema(0.1);
    fast.next(0);
    slow.next(0);
    const fastV = fast.next(100);
    const slowV = slow.next(100);
    expect(fastV).toBeGreaterThan(slowV);
  });

  it('reset() clears state so the next value passes through', () => {
    const ema = new Ema(0.5);
    ema.next(10);
    ema.next(20);
    ema.reset();
    expect(ema.current()).toBeNull();
    expect(ema.next(7)).toBe(7);
  });
});

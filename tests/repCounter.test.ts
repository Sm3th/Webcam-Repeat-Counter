import { describe, expect, it } from 'vitest';
import {
  RepCounter,
  type RepCounterConfig,
} from '../src/features/rep-counter/engine/repCounter';

const CFG: RepCounterConfig = {
  downEnter: 95,
  upEnter: 155,
  minRepMs: 500,
  targetDepth: 90,
};

/** Feed a sequence of [angle, t] readings (all valid) and return the final state. */
function feed(rc: RepCounter, seq: Array<[number, number]>) {
  let last = rc.update(180, true, 0);
  for (const [angle, t] of seq) last = rc.update(angle, true, t);
  return last;
}

describe('RepCounter', () => {
  it('counts one clean down→up cycle', () => {
    const rc = new RepCounter(CFG);
    const r = feed(rc, [
      [170, 0],
      [80, 300],
      [170, 900],
    ]);
    expect(r.count).toBe(1);
    expect(r.phase).toBe('up');
  });

  it('counts three clean cycles', () => {
    const rc = new RepCounter(CFG);
    let t = 0;
    for (let i = 0; i < 3; i++) {
      rc.update(170, true, t);
      rc.update(80, true, t + 300);
      rc.update(170, true, t + 900);
      t += 1200;
    }
    expect(rc.update(170, true, t).count).toBe(3);
  });

  it('hysteresis: oscillating between thresholds never counts', () => {
    const rc = new RepCounter(CFG);
    let t = 0;
    let r = rc.update(180, true, t);
    for (let i = 0; i < 10; i++) {
      // Stays above downEnter (95) the whole time → never enters "down".
      r = rc.update(120, true, (t += 100));
      r = rc.update(150, true, (t += 100));
    }
    expect(r.count).toBe(0);
  });

  it('hysteresis 2: noise around upEnter while already up never counts', () => {
    const rc = new RepCounter(CFG);
    let t = 0;
    let r = rc.update(180, true, t);
    for (let i = 0; i < 10; i++) {
      r = rc.update(150, true, (t += 100));
      r = rc.update(160, true, (t += 100));
    }
    expect(r.count).toBe(0);
  });

  it('debounce: a down→up span shorter than minRepMs is not counted', () => {
    const rc = new RepCounter(CFG);
    const r = feed(rc, [
      [170, 0],
      [80, 100],
      [170, 300], // span 200ms < 500ms
    ]);
    expect(r.count).toBe(0);
  });

  it('ignores invalid frames; a rep split by invalid frames still counts once', () => {
    const rc = new RepCounter(CFG);
    rc.update(180, true, 0);
    rc.update(80, true, 300); // enter down
    rc.update(NaN, false, 500); // invalid — ignored
    rc.update(170, false, 600); // invalid even though > upEnter — ignored
    const r = rc.update(170, true, 900); // valid → completes the single rep
    expect(r.count).toBe(1);
  });

  it('partial rep: dipping toward but never below downEnter does not count', () => {
    const rc = new RepCounter(CFG);
    const r = feed(rc, [
      [170, 0],
      [100, 300], // above downEnter (95)
      [170, 900],
    ]);
    expect(r.count).toBe(0);
  });

  it('form: reaching target depth → goodForm true', () => {
    const rc = new RepCounter(CFG);
    const r = feed(rc, [
      [170, 0],
      [85, 300], // <= targetDepth 90
      [170, 900],
    ]);
    expect(r.count).toBe(1);
    expect(r.lastRepGoodForm).toBe(true);
  });

  it('form: shallow rep → goodForm false', () => {
    const rc = new RepCounter(CFG);
    const r = feed(rc, [
      [170, 0],
      [93, 300], // below downEnter (95) but above targetDepth (90)
      [170, 900],
    ]);
    expect(r.count).toBe(1);
    expect(r.lastRepGoodForm).toBe(false);
  });

  it('reports null form when targetDepth is not configured', () => {
    const rc = new RepCounter({ downEnter: 95, upEnter: 155, minRepMs: 500 });
    const r = feed(rc, [
      [170, 0],
      [80, 300],
      [170, 900],
    ]);
    expect(r.count).toBe(1);
    expect(r.lastRepGoodForm).toBeNull();
  });

  describe("direction: 'extend' (e.g. shoulder press)", () => {
    const EXT = {
      downEnter: 95,
      upEnter: 150,
      minRepMs: 500,
      targetDepth: 160,
      direction: 'extend' as const,
    };

    it('counts one clean small→large→small cycle', () => {
      const rc = new RepCounter(EXT);
      let r = rc.update(80, true, 0); // racked (small)
      r = rc.update(165, true, 400); // pressed up (large)
      r = rc.update(80, true, 900); // returned
      expect(r.count).toBe(1);
    });

    it('phase reports up at full extension, down when racked', () => {
      const rc = new RepCounter(EXT);
      rc.update(80, true, 0);
      expect(rc.update(165, true, 400).phase).toBe('up'); // extended = up
      expect(rc.update(80, true, 900).phase).toBe('down'); // racked = down
    });

    it('good form requires reaching lockout (max angle >= targetDepth)', () => {
      const rc = new RepCounter(EXT);
      rc.update(80, true, 0);
      rc.update(155, true, 400); // above upEnter but below targetDepth 160
      const r = rc.update(80, true, 900);
      expect(r.count).toBe(1);
      expect(r.lastRepGoodForm).toBe(false);

      const rc2 = new RepCounter(EXT);
      rc2.update(80, true, 0);
      rc2.update(168, true, 400); // past lockout
      const r2 = rc2.update(80, true, 900);
      expect(r2.lastRepGoodForm).toBe(true);
    });

    it('partial press that never passes upEnter does not count', () => {
      const rc = new RepCounter(EXT);
      let r = rc.update(80, true, 0);
      r = rc.update(140, true, 400); // below upEnter 150
      r = rc.update(80, true, 900);
      expect(r.count).toBe(0);
    });

    it('debounce applies to extend reps too', () => {
      const rc = new RepCounter(EXT);
      rc.update(80, true, 0);
      rc.update(165, true, 100);
      const r = rc.update(80, true, 300); // span 200ms < 500ms
      expect(r.count).toBe(0);
    });
  });

  it('reset() zeroes count and phase', () => {
    const rc = new RepCounter(CFG);
    feed(rc, [
      [170, 0],
      [80, 300],
      [170, 900],
    ]);
    rc.reset();
    const r = rc.update(180, true, 1000);
    expect(r.count).toBe(0);
    expect(r.phase).toBe('up');
    expect(r.lastRepGoodForm).toBeNull();
  });
});

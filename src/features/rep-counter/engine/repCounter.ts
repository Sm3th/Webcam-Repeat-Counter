import type { Phase } from './types';

export interface RepCounterConfig {
  downEnter: number; // enter "down" when smoothed angle < this
  upEnter: number; // count rep when, while "down", smoothed angle > this  (upEnter > downEnter)
  minRepMs: number; // debounce: reject reps whose down->up span is shorter than this
  targetDepth?: number; // optional: a rep is "good form" if min angle reached <= this
}

export interface RepUpdate {
  count: number;
  phase: Phase;
  lastRepGoodForm: boolean | null; // null when targetDepth not set or no rep yet
}

export class RepCounter {
  private count = 0;
  private phase: Phase = 'up';
  private downStartTime = 0;
  private minAngleThisRep = Infinity;
  private lastRepGoodForm: boolean | null = null;

  constructor(private readonly cfg: RepCounterConfig) {}

  /** Feed one smoothed angle reading. `valid` = required keypoints were confident this frame. */
  update(angle: number, valid: boolean, t: number): RepUpdate {
    if (!valid || Number.isNaN(angle)) return this.snapshot(); // skip: don't advance state

    if (this.phase === 'up') {
      if (angle < this.cfg.downEnter) {
        this.phase = 'down';
        this.downStartTime = t;
        this.minAngleThisRep = angle;
      }
    } else {
      // phase === 'down'
      this.minAngleThisRep = Math.min(this.minAngleThisRep, angle);
      if (angle > this.cfg.upEnter) {
        const span = t - this.downStartTime;
        if (span >= this.cfg.minRepMs) {
          this.count += 1;
          this.lastRepGoodForm =
            this.cfg.targetDepth != null
              ? this.minAngleThisRep <= this.cfg.targetDepth
              : null;
        }
        this.phase = 'up';
        this.minAngleThisRep = Infinity;
      }
    }
    return this.snapshot();
  }

  reset(): void {
    this.count = 0;
    this.phase = 'up';
    this.downStartTime = 0;
    this.minAngleThisRep = Infinity;
    this.lastRepGoodForm = null;
  }

  private snapshot(): RepUpdate {
    return {
      count: this.count,
      phase: this.phase,
      lastRepGoodForm: this.lastRepGoodForm,
    };
  }
}

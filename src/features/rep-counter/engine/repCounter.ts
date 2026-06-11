import type { Phase } from './types';

/**
 * Movement direction relative to the tracked joint angle:
 *  - 'flex'   : the rep flexes the joint — starts at a LARGE angle, dips to a SMALL
 *               one, returns large (push-up, squat, curl, …). [default]
 *  - 'extend' : the rep extends the joint — starts SMALL, opens to a LARGE angle,
 *               returns small (overhead/shoulder press, …).
 */
export type RepDirection = 'flex' | 'extend';

export interface RepCounterConfig {
  downEnter: number; // the SMALL-angle threshold (numerically < upEnter)
  upEnter: number; // the LARGE-angle threshold
  minRepMs: number; // debounce: reject reps whose active span is shorter than this
  /**
   * Optional "good form" gate. flex: good if the rep's MIN angle <= targetDepth
   * (went deep enough). extend: good if the rep's MAX angle >= targetDepth
   * (locked out far enough).
   */
  targetDepth?: number;
  direction?: RepDirection; // default 'flex'
}

export interface RepUpdate {
  count: number;
  phase: Phase; // body position: 'up' = large angle, 'down' = small angle
  lastRepGoodForm: boolean | null; // null when targetDepth not set or no rep yet
  lastRepTempoMs: number | null; // active duration of the most recent rep
  lastRepRomDeg: number | null; // range of motion (max−min angle) of the most recent rep
}

export class RepCounter {
  private count = 0;
  /** Internal state: 'up' = resting, 'down' = active (mid-rep). */
  private resting: 'up' | 'down' = 'up';
  private activeStartTime = 0;
  private minThisRep = NaN;
  private maxThisRep = NaN;
  private lastRepGoodForm: boolean | null = null;
  private lastRepTempoMs: number | null = null;
  private lastRepRomDeg: number | null = null;

  constructor(private readonly cfg: RepCounterConfig) {}

  private get direction(): RepDirection {
    return this.cfg.direction ?? 'flex';
  }

  /** Feed one smoothed angle reading. `valid` = required keypoints were confident this frame. */
  update(angle: number, valid: boolean, t: number): RepUpdate {
    if (!valid || Number.isNaN(angle)) return this.snapshot(); // skip: don't advance state

    const flex = this.direction === 'flex';

    if (this.resting === 'up') {
      // Enter the active phase when the joint leaves its resting extreme.
      const entered = flex ? angle < this.cfg.downEnter : angle > this.cfg.upEnter;
      if (entered) {
        this.resting = 'down';
        this.activeStartTime = t;
        this.minThisRep = angle;
        this.maxThisRep = angle;
      }
    } else {
      // Active phase: track the rep's swept range and watch for the return.
      this.minThisRep = Math.min(this.minThisRep, angle);
      this.maxThisRep = Math.max(this.maxThisRep, angle);

      const completed = flex ? angle > this.cfg.upEnter : angle < this.cfg.downEnter;
      if (completed) {
        const span = t - this.activeStartTime;
        if (span >= this.cfg.minRepMs) {
          this.count += 1;
          const peak = flex ? this.minThisRep : this.maxThisRep;
          this.lastRepGoodForm =
            this.cfg.targetDepth != null
              ? flex
                ? peak <= this.cfg.targetDepth
                : peak >= this.cfg.targetDepth
              : null;
          this.lastRepTempoMs = span;
          this.lastRepRomDeg = this.maxThisRep - this.minThisRep;
        }
        this.resting = 'up';
        this.minThisRep = NaN;
        this.maxThisRep = NaN;
      }
    }
    return this.snapshot();
  }

  reset(): void {
    this.count = 0;
    this.resting = 'up';
    this.activeStartTime = 0;
    this.minThisRep = NaN;
    this.maxThisRep = NaN;
    this.lastRepGoodForm = null;
    this.lastRepTempoMs = null;
    this.lastRepRomDeg = null;
  }

  private snapshot(): RepUpdate {
    // Map the internal rest/active state to a body-position phase that is
    // consistent across directions ('up' = large angle, 'down' = small angle).
    const phase: Phase =
      this.direction === 'flex'
        ? this.resting
        : this.resting === 'up'
          ? 'down'
          : 'up';
    return {
      count: this.count,
      phase,
      lastRepGoodForm: this.lastRepGoodForm,
      lastRepTempoMs: this.lastRepTempoMs,
      lastRepRomDeg: this.lastRepRomDeg,
    };
  }
}

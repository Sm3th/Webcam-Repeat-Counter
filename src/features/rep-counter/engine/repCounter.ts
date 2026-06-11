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
}

export class RepCounter {
  private count = 0;
  /** Internal state: 'up' = resting, 'down' = active (mid-rep). */
  private resting: 'up' | 'down' = 'up';
  private activeStartTime = 0;
  private extremumThisRep = NaN; // min angle (flex) or max angle (extend) this rep
  private lastRepGoodForm: boolean | null = null;

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
        this.extremumThisRep = angle;
      }
    } else {
      // Active phase: track the rep's extremum and watch for the return.
      this.extremumThisRep = flex
        ? Math.min(this.extremumThisRep, angle)
        : Math.max(this.extremumThisRep, angle);

      const completed = flex ? angle > this.cfg.upEnter : angle < this.cfg.downEnter;
      if (completed) {
        const span = t - this.activeStartTime;
        if (span >= this.cfg.minRepMs) {
          this.count += 1;
          this.lastRepGoodForm =
            this.cfg.targetDepth != null
              ? flex
                ? this.extremumThisRep <= this.cfg.targetDepth
                : this.extremumThisRep >= this.cfg.targetDepth
              : null;
        }
        this.resting = 'up';
        this.extremumThisRep = NaN;
      }
    }
    return this.snapshot();
  }

  reset(): void {
    this.count = 0;
    this.resting = 'up';
    this.activeStartTime = 0;
    this.extremumThisRep = NaN;
    this.lastRepGoodForm = null;
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
    };
  }
}

/** Exponential moving average. alpha in (0,1]; higher = more responsive, less smooth. */
export class Ema {
  private value: number | null = null;
  constructor(private readonly alpha: number) {}
  next(x: number): number {
    this.value = this.value === null ? x : this.alpha * x + (1 - this.alpha) * this.value;
    return this.value;
  }
  current(): number | null {
    return this.value;
  }
  reset(): void {
    this.value = null;
  }
}

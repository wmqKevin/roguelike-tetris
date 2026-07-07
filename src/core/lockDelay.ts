export class LockDelay {
  private elapsed = 0;
  private resets = 0;

  constructor(private readonly delayMs = 500, private readonly resetCap = 15) {}

  resetByMovement(): void {
    if (this.resets < this.resetCap) {
      this.elapsed = 0;
      this.resets += 1;
    }
  }

  step(deltaMs: number): boolean {
    this.elapsed += deltaMs;
    return this.elapsed >= this.delayMs;
  }

  fresh(): void {
    this.elapsed = 0;
    this.resets = 0;
  }
}

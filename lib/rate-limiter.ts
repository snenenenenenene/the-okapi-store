class RateLimiter {
  private timestamps: number[] = [];
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 30) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  async checkLimit(): Promise<boolean> {
    const now = Date.now();
    
    // Remove timestamps outside the window
    this.timestamps = this.timestamps.filter(
      timestamp => now - timestamp < this.windowMs
    );

    if (this.timestamps.length >= this.maxRequests) {
      return false;
    }

    this.timestamps.push(now);
    return true;
  }

  getNextAllowedTime(): number {
    if (this.timestamps.length === 0) return 0;
    
    const oldestTimestamp = this.timestamps[0];
    return Math.max(0, this.windowMs - (Date.now() - oldestTimestamp));
  }
}

export const printfulRateLimiter = new RateLimiter(60000, 30); // 30 requests per minute

/**
 * In-Memory Rate Limiter
 * Simple rate limiting for small-scale deployments
 * NO external dependencies - 100% FREE
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

class InMemoryRateLimiter {
  private limits = new Map<string, RateLimitEntry>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig = { maxRequests: 100, windowMs: 60000 }) {
    this.config = config;
  }

  /**
   * Check if request is allowed
   * @param identifier - Unique identifier (IP, user ID, etc.)
   * @returns true if allowed, false if rate limited
   */
  check(identifier: string): boolean {
    const now = Date.now();
    const entry = this.limits.get(identifier);

    // No entry or expired window - allow and create new entry
    if (!entry || now > entry.resetTime) {
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return true;
    }

    // Within window - check count
    if (entry.count < this.config.maxRequests) {
      entry.count++;
      return true;
    }

    // Rate limit exceeded
    return false;
  }

  /**
   * Get remaining requests for identifier
   */
  getRemaining(identifier: string): number {
    const entry = this.limits.get(identifier);
    if (!entry || Date.now() > entry.resetTime) {
      return this.config.maxRequests;
    }
    return Math.max(0, this.config.maxRequests - entry.count);
  }

  /**
   * Get reset time for identifier
   */
  getResetTime(identifier: string): number {
    const entry = this.limits.get(identifier);
    if (!entry || Date.now() > entry.resetTime) {
      return Date.now() + this.config.windowMs;
    }
    return entry.resetTime;
  }

  /**
   * Reset rate limit for specific identifier
   */
  reset(identifier: string): void {
    this.limits.delete(identifier);
  }

  /**
   * Reset all rate limits
   */
  resetAll(): void {
    this.limits.clear();
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Get statistics
   */
  stats() {
    return {
      activeEntries: this.limits.size,
      config: this.config,
    };
  }
}

// Singleton instances for different use cases
export const apiRateLimiter = new InMemoryRateLimiter({
  maxRequests: 100,
  windowMs: 60000, // 100 requests per minute
});

export const authRateLimiter = new InMemoryRateLimiter({
  maxRequests: 5,
  windowMs: 60000, // 5 login attempts per minute
});

export const strictRateLimiter = new InMemoryRateLimiter({
  maxRequests: 10,
  windowMs: 60000, // 10 requests per minute (for sensitive endpoints)
});

// Periodic cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      const cleaned =
        apiRateLimiter.cleanup() +
        authRateLimiter.cleanup() +
        strictRateLimiter.cleanup();

      if (cleaned > 0) {
        console.log(`[RateLimiter] Cleaned ${cleaned} expired entries`);
      }
    },
    5 * 60 * 1000,
  );
}

// Export class for custom limiters
export { InMemoryRateLimiter };

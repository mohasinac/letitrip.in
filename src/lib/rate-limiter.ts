/**
 * Rate Limiter
 *
 * In-memory rate limiting using sliding window algorithm.
 * Tracks requests per identifier (IP, user ID, etc.) and enforces limits.
 *
 * @example
 * ```typescript
 * const limiter = new RateLimiter({
 *   points: 10,      // Number of requests
 *   duration: 60,    // Per 60 seconds
 * });
 *
 * // Check and consume
 * try {
 *   await limiter.consume(clientIp);
 *   // Request allowed
 * } catch (error) {
 *   // Rate limit exceeded
 *   console.log(`Retry after ${error.msBeforeNext}ms`);
 * }
 * ```
 */

export interface RateLimiterOptions {
  /**
   * Maximum number of points (requests) allowed
   */
  points: number;

  /**
   * Duration in seconds for the rate limit window
   */
  duration: number;

  /**
   * Block duration in seconds when limit is exceeded
   * @default Same as duration
   */
  blockDuration?: number;

  /**
   * Execute callback when limit is exceeded
   */
  execEvenly?: boolean;

  /**
   * Key prefix for storage
   * @default "rl"
   */
  keyPrefix?: string;
}

export interface RateLimiterResponse {
  /**
   * Number of points consumed by this request
   */
  consumedPoints: number;

  /**
   * Remaining points in current window
   */
  remainingPoints: number;

  /**
   * Milliseconds until limit resets
   */
  msBeforeNext: number;

  /**
   * Whether the request is allowed
   */
  isAllowed: boolean;
}

export class RateLimitError extends Error {
  public consumedPoints: number;
  public remainingPoints: number;
  public msBeforeNext: number;
  public retryAfter: number; // seconds

  constructor(response: RateLimiterResponse) {
    super("Rate limit exceeded");
    this.name = "RateLimitError";
    this.consumedPoints = response.consumedPoints;
    this.remainingPoints = response.remainingPoints;
    this.msBeforeNext = response.msBeforeNext;
    this.retryAfter = Math.ceil(response.msBeforeNext / 1000);
  }
}

interface RequestRecord {
  points: number;
  timestamp: number;
  expiresAt: number;
}

/**
 * In-memory rate limiter using sliding window algorithm
 */
export class RateLimiter {
  private readonly points: number;
  private readonly duration: number; // seconds
  private readonly blockDuration: number; // seconds
  private readonly keyPrefix: string;
  private readonly storage: Map<string, RequestRecord>;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(options: RateLimiterOptions) {
    this.points = options.points;
    this.duration = options.duration;
    this.blockDuration = options.blockDuration ?? options.duration;
    this.keyPrefix = options.keyPrefix ?? "rl";
    this.storage = new Map();

    // Start cleanup interval to remove expired entries
    this.startCleanup();
  }

  /**
   * Get storage key for identifier
   */
  private getKey(identifier: string): string {
    return `${this.keyPrefix}:${identifier}`;
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanup(): void {
    // Clean up every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.storage.entries()) {
        if (record.expiresAt < now) {
          this.storage.delete(key);
        }
      }
    }, 60000);

    // Allow Node.js to exit even if cleanup is running
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Stop cleanup interval
   */
  public stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Get current state for an identifier
   */
  public get(identifier: string): RateLimiterResponse | null {
    const key = this.getKey(identifier);
    const record = this.storage.get(key);

    if (!record) {
      return null;
    }

    const now = Date.now();

    // Check if expired
    if (record.expiresAt < now) {
      this.storage.delete(key);
      return null;
    }

    const remainingPoints = Math.max(0, this.points - record.points);
    const msBeforeNext = Math.max(0, record.expiresAt - now);

    return {
      consumedPoints: record.points,
      remainingPoints,
      msBeforeNext,
      isAllowed: remainingPoints > 0,
    };
  }

  /**
   * Consume points for an identifier
   *
   * @param identifier - Unique identifier (IP, user ID, etc.)
   * @param points - Number of points to consume (default: 1)
   * @throws {RateLimitError} When rate limit is exceeded
   */
  public async consume(
    identifier: string,
    points: number = 1
  ): Promise<RateLimiterResponse> {
    const key = this.getKey(identifier);
    const now = Date.now();
    const record = this.storage.get(key);

    if (!record || record.expiresAt < now) {
      // New window or expired
      const expiresAt = now + this.duration * 1000;
      const newRecord: RequestRecord = {
        points,
        timestamp: now,
        expiresAt,
      };

      this.storage.set(key, newRecord);

      return {
        consumedPoints: points,
        remainingPoints: this.points - points,
        msBeforeNext: this.duration * 1000,
        isAllowed: true,
      };
    }

    // Existing window
    const newPoints = record.points + points;

    if (newPoints > this.points) {
      // Rate limit exceeded
      const remainingPoints = 0;
      const msBeforeNext = Math.max(0, record.expiresAt - now);

      const response: RateLimiterResponse = {
        consumedPoints: record.points,
        remainingPoints,
        msBeforeNext,
        isAllowed: false,
      };

      throw new RateLimitError(response);
    }

    // Update record
    record.points = newPoints;
    this.storage.set(key, record);

    const remainingPoints = this.points - newPoints;
    const msBeforeNext = Math.max(0, record.expiresAt - now);

    return {
      consumedPoints: newPoints,
      remainingPoints,
      msBeforeNext,
      isAllowed: true,
    };
  }

  /**
   * Penalty for an identifier (add extra points without throwing)
   *
   * @param identifier - Unique identifier
   * @param points - Number of penalty points
   */
  public async penalty(
    identifier: string,
    points: number = 1
  ): Promise<RateLimiterResponse> {
    const key = this.getKey(identifier);
    const now = Date.now();
    const record = this.storage.get(key);

    if (!record || record.expiresAt < now) {
      // Create new record with penalty
      const expiresAt = now + this.blockDuration * 1000;
      const newRecord: RequestRecord = {
        points,
        timestamp: now,
        expiresAt,
      };

      this.storage.set(key, newRecord);

      return {
        consumedPoints: points,
        remainingPoints: Math.max(0, this.points - points),
        msBeforeNext: this.blockDuration * 1000,
        isAllowed: points <= this.points,
      };
    }

    // Add penalty to existing record
    record.points += points;
    this.storage.set(key, record);

    const remainingPoints = Math.max(0, this.points - record.points);
    const msBeforeNext = Math.max(0, record.expiresAt - now);

    return {
      consumedPoints: record.points,
      remainingPoints,
      msBeforeNext,
      isAllowed: remainingPoints > 0,
    };
  }

  /**
   * Reward an identifier (reduce consumed points)
   *
   * @param identifier - Unique identifier
   * @param points - Number of points to reward
   */
  public async reward(
    identifier: string,
    points: number = 1
  ): Promise<RateLimiterResponse> {
    const key = this.getKey(identifier);
    const record = this.storage.get(key);

    if (!record) {
      return {
        consumedPoints: 0,
        remainingPoints: this.points,
        msBeforeNext: 0,
        isAllowed: true,
      };
    }

    const now = Date.now();

    // Check if expired
    if (record.expiresAt < now) {
      this.storage.delete(key);
      return {
        consumedPoints: 0,
        remainingPoints: this.points,
        msBeforeNext: 0,
        isAllowed: true,
      };
    }

    // Reduce consumed points (min 0)
    record.points = Math.max(0, record.points - points);
    this.storage.set(key, record);

    const remainingPoints = this.points - record.points;
    const msBeforeNext = Math.max(0, record.expiresAt - now);

    return {
      consumedPoints: record.points,
      remainingPoints,
      msBeforeNext,
      isAllowed: true,
    };
  }

  /**
   * Reset rate limit for an identifier
   *
   * @param identifier - Unique identifier
   */
  public async delete(identifier: string): Promise<boolean> {
    const key = this.getKey(identifier);
    return this.storage.delete(key);
  }

  /**
   * Block an identifier for the block duration
   *
   * @param identifier - Unique identifier
   */
  public async block(identifier: string): Promise<RateLimiterResponse> {
    const key = this.getKey(identifier);
    const now = Date.now();
    const expiresAt = now + this.blockDuration * 1000;

    const record: RequestRecord = {
      points: this.points + 1, // Exceed limit
      timestamp: now,
      expiresAt,
    };

    this.storage.set(key, record);

    return {
      consumedPoints: record.points,
      remainingPoints: 0,
      msBeforeNext: this.blockDuration * 1000,
      isAllowed: false,
    };
  }

  /**
   * Get total number of tracked identifiers
   */
  public getTrackedCount(): number {
    return this.storage.size;
  }

  /**
   * Clear all rate limit data
   */
  public clear(): void {
    this.storage.clear();
  }

  /**
   * Static factory method
   */
  public static create(options: RateLimiterOptions): RateLimiter {
    return new RateLimiter(options);
  }
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const RateLimiters = {
  /**
   * Strict rate limiter for authentication endpoints
   * 5 requests per 15 minutes
   */
  auth: new RateLimiter({
    points: 5,
    duration: 15 * 60, // 15 minutes
    blockDuration: 15 * 60,
    keyPrefix: "rl:auth",
  }),

  /**
   * Standard rate limiter for API endpoints
   * 100 requests per minute
   */
  api: new RateLimiter({
    points: 100,
    duration: 60, // 1 minute
    keyPrefix: "rl:api",
  }),

  /**
   * Lenient rate limiter for public endpoints
   * 300 requests per minute
   */
  public: new RateLimiter({
    points: 300,
    duration: 60, // 1 minute
    keyPrefix: "rl:public",
  }),

  /**
   * Very strict rate limiter for password reset
   * 3 requests per hour
   */
  passwordReset: new RateLimiter({
    points: 3,
    duration: 60 * 60, // 1 hour
    blockDuration: 60 * 60,
    keyPrefix: "rl:pwd-reset",
  }),

  /**
   * Moderate rate limiter for search endpoints
   * 60 requests per minute
   */
  search: new RateLimiter({
    points: 60,
    duration: 60, // 1 minute
    keyPrefix: "rl:search",
  }),
};

/**
 * Unit Tests for Rate Limiter
 * Tests in-memory rate limiting functionality
 */

import { InMemoryRateLimiter } from "../rate-limiter";

describe("InMemoryRateLimiter", () => {
  let limiter: InMemoryRateLimiter;

  beforeEach(() => {
    limiter = new InMemoryRateLimiter({ maxRequests: 5, windowMs: 1000 });
  });

  afterEach(() => {
    limiter.resetAll();
  });

  describe("Basic Rate Limiting", () => {
    it("should allow requests within limit", () => {
      const identifier = "user123";

      for (let i = 0; i < 5; i++) {
        expect(limiter.check(identifier)).toBe(true);
      }
    });

    it("should block requests exceeding limit", () => {
      const identifier = "user123";

      // Use up the limit
      for (let i = 0; i < 5; i++) {
        limiter.check(identifier);
      }

      // 6th request should be blocked
      expect(limiter.check(identifier)).toBe(false);
    });

    it("should handle different identifiers independently", () => {
      expect(limiter.check("user1")).toBe(true);
      expect(limiter.check("user2")).toBe(true);
      expect(limiter.check("user1")).toBe(true);
      expect(limiter.check("user2")).toBe(true);
    });

    it("should track count correctly", () => {
      const identifier = "user123";

      limiter.check(identifier);
      limiter.check(identifier);
      limiter.check(identifier);

      expect(limiter.getRemaining(identifier)).toBe(2);
    });

    it("should reset after window expires", async () => {
      const shortLimiter = new InMemoryRateLimiter({
        maxRequests: 2,
        windowMs: 50,
      });
      const identifier = "user123";

      // Use up limit
      expect(shortLimiter.check(identifier)).toBe(true);
      expect(shortLimiter.check(identifier)).toBe(true);
      expect(shortLimiter.check(identifier)).toBe(false);

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 60));

      // Should allow requests again
      expect(shortLimiter.check(identifier)).toBe(true);
    });

    it("should handle zero identifier", () => {
      expect(limiter.check("0")).toBe(true);
      expect(limiter.check("0")).toBe(true);
    });

    it("should handle empty string identifier", () => {
      expect(limiter.check("")).toBe(true);
      expect(limiter.check("")).toBe(true);
    });

    it("should handle special characters in identifier", () => {
      const identifier = "user@email.com:192.168.1.1";
      expect(limiter.check(identifier)).toBe(true);
      expect(limiter.check(identifier)).toBe(true);
    });
  });

  describe("getRemaining", () => {
    it("should return max requests for new identifier", () => {
      expect(limiter.getRemaining("newuser")).toBe(5);
    });

    it("should decrease with each request", () => {
      const identifier = "user123";

      limiter.check(identifier);
      expect(limiter.getRemaining(identifier)).toBe(4);

      limiter.check(identifier);
      expect(limiter.getRemaining(identifier)).toBe(3);

      limiter.check(identifier);
      expect(limiter.getRemaining(identifier)).toBe(2);
    });

    it("should return 0 when limit exceeded", () => {
      const identifier = "user123";

      for (let i = 0; i < 5; i++) {
        limiter.check(identifier);
      }

      expect(limiter.getRemaining(identifier)).toBe(0);
    });

    it("should reset to max after window expires", async () => {
      const shortLimiter = new InMemoryRateLimiter({
        maxRequests: 3,
        windowMs: 50,
      });
      const identifier = "user123";

      shortLimiter.check(identifier);
      shortLimiter.check(identifier);
      expect(shortLimiter.getRemaining(identifier)).toBe(1);

      await new Promise((resolve) => setTimeout(resolve, 60));

      expect(shortLimiter.getRemaining(identifier)).toBe(3);
    });

    it("should never return negative values", () => {
      const identifier = "user123";

      for (let i = 0; i < 10; i++) {
        limiter.check(identifier);
      }

      const remaining = limiter.getRemaining(identifier);
      expect(remaining).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getResetTime", () => {
    it("should return future timestamp for new identifier", () => {
      const identifier = "user123";
      limiter.check(identifier);

      const resetTime = limiter.getResetTime(identifier);
      expect(resetTime).toBeGreaterThan(Date.now());
    });

    it("should return consistent reset time within window", () => {
      const identifier = "user123";
      limiter.check(identifier);

      const resetTime1 = limiter.getResetTime(identifier);

      limiter.check(identifier);
      const resetTime2 = limiter.getResetTime(identifier);

      expect(resetTime1).toBe(resetTime2);
    });

    it("should calculate correct reset time", () => {
      const identifier = "user123";
      const before = Date.now();
      limiter.check(identifier);
      const resetTime = limiter.getResetTime(identifier);

      // Should be approximately windowMs (1000ms) in the future
      const diff = resetTime - before;
      expect(diff).toBeGreaterThan(950);
      expect(diff).toBeLessThan(1050);
    });

    it("should update reset time after window expires", async () => {
      const shortLimiter = new InMemoryRateLimiter({
        maxRequests: 2,
        windowMs: 50,
      });
      const identifier = "user123";

      shortLimiter.check(identifier);
      const resetTime1 = shortLimiter.getResetTime(identifier);

      await new Promise((resolve) => setTimeout(resolve, 60));

      shortLimiter.check(identifier);
      const resetTime2 = shortLimiter.getResetTime(identifier);

      expect(resetTime2).toBeGreaterThan(resetTime1);
    });
  });

  describe("reset", () => {
    it("should reset specific identifier", () => {
      const identifier = "user123";

      limiter.check(identifier);
      limiter.check(identifier);
      limiter.check(identifier);

      limiter.reset(identifier);

      expect(limiter.getRemaining(identifier)).toBe(5);
      expect(limiter.check(identifier)).toBe(true);
    });

    it("should not affect other identifiers", () => {
      limiter.check("user1");
      limiter.check("user1");
      limiter.check("user2");
      limiter.check("user2");

      limiter.reset("user1");

      expect(limiter.getRemaining("user1")).toBe(5);
      expect(limiter.getRemaining("user2")).toBe(3);
    });

    it("should handle resetting non-existent identifier", () => {
      expect(() => limiter.reset("nonexistent")).not.toThrow();
    });

    it("should allow unlimited requests after reset", () => {
      const identifier = "user123";

      for (let i = 0; i < 5; i++) {
        limiter.check(identifier);
      }

      limiter.reset(identifier);

      for (let i = 0; i < 5; i++) {
        expect(limiter.check(identifier)).toBe(true);
      }
    });
  });

  describe("resetAll", () => {
    it("should reset all identifiers", () => {
      limiter.check("user1");
      limiter.check("user1");
      limiter.check("user2");
      limiter.check("user2");
      limiter.check("user3");

      limiter.resetAll();

      expect(limiter.getRemaining("user1")).toBe(5);
      expect(limiter.getRemaining("user2")).toBe(5);
      expect(limiter.getRemaining("user3")).toBe(5);
    });

    it("should allow requests after resetAll", () => {
      for (let i = 0; i < 5; i++) {
        limiter.check("user1");
      }

      limiter.resetAll();

      expect(limiter.check("user1")).toBe(true);
    });

    it("should handle empty limiter", () => {
      expect(() => limiter.resetAll()).not.toThrow();
    });
  });

  describe("cleanup", () => {
    it("should remove expired entries", async () => {
      const shortLimiter = new InMemoryRateLimiter({
        maxRequests: 2,
        windowMs: 50,
      });

      shortLimiter.check("user1");
      shortLimiter.check("user2");
      shortLimiter.check("user3");

      await new Promise((resolve) => setTimeout(resolve, 60));

      const cleaned = shortLimiter.cleanup();

      expect(cleaned).toBe(3);
    });

    it("should not remove active entries", () => {
      limiter.check("user1");
      limiter.check("user2");

      const cleaned = limiter.cleanup();

      expect(cleaned).toBe(0);
      expect(limiter.getRemaining("user1")).toBe(4);
      expect(limiter.getRemaining("user2")).toBe(4);
    });

    it("should handle mixed expired and active entries", async () => {
      const shortLimiter = new InMemoryRateLimiter({
        maxRequests: 2,
        windowMs: 50,
      });

      shortLimiter.check("expired1");
      shortLimiter.check("expired2");

      await new Promise((resolve) => setTimeout(resolve, 60));

      shortLimiter.check("active1");
      shortLimiter.check("active2");

      const cleaned = shortLimiter.cleanup();

      expect(cleaned).toBe(2);
      expect(shortLimiter.getRemaining("active1")).toBe(1);
      expect(shortLimiter.getRemaining("active2")).toBe(1);
    });

    it("should return 0 when no entries to clean", () => {
      const cleaned = limiter.cleanup();
      expect(cleaned).toBe(0);
    });
  });

  describe("Custom Configuration", () => {
    it("should respect custom maxRequests", () => {
      const customLimiter = new InMemoryRateLimiter({
        maxRequests: 3,
        windowMs: 1000,
      });
      const identifier = "user123";

      expect(customLimiter.check(identifier)).toBe(true);
      expect(customLimiter.check(identifier)).toBe(true);
      expect(customLimiter.check(identifier)).toBe(true);
      expect(customLimiter.check(identifier)).toBe(false);
    });

    it("should respect custom windowMs", async () => {
      const customLimiter = new InMemoryRateLimiter({
        maxRequests: 1,
        windowMs: 100,
      });
      const identifier = "user123";

      customLimiter.check(identifier);
      expect(customLimiter.check(identifier)).toBe(false);

      await new Promise((resolve) => setTimeout(resolve, 110));

      expect(customLimiter.check(identifier)).toBe(true);
    });

    it("should handle very low limits", () => {
      const strictLimiter = new InMemoryRateLimiter({
        maxRequests: 1,
        windowMs: 1000,
      });
      const identifier = "user123";

      expect(strictLimiter.check(identifier)).toBe(true);
      expect(strictLimiter.check(identifier)).toBe(false);
    });

    it("should handle very high limits", () => {
      const generousLimiter = new InMemoryRateLimiter({
        maxRequests: 1000,
        windowMs: 1000,
      });
      const identifier = "user123";

      for (let i = 0; i < 1000; i++) {
        expect(generousLimiter.check(identifier)).toBe(true);
      }

      expect(generousLimiter.check(identifier)).toBe(false);
    });

    it("should handle very short windows", async () => {
      const fastLimiter = new InMemoryRateLimiter({
        maxRequests: 2,
        windowMs: 10,
      });
      const identifier = "user123";

      fastLimiter.check(identifier);
      fastLimiter.check(identifier);

      await new Promise((resolve) => setTimeout(resolve, 15));

      expect(fastLimiter.check(identifier)).toBe(true);
    });

    it("should handle very long windows", () => {
      const slowLimiter = new InMemoryRateLimiter({
        maxRequests: 2,
        windowMs: 86400000,
      }); // 1 day
      const identifier = "user123";

      expect(slowLimiter.check(identifier)).toBe(true);
      expect(slowLimiter.check(identifier)).toBe(true);
      expect(slowLimiter.check(identifier)).toBe(false);

      const resetTime = slowLimiter.getResetTime(identifier);
      const now = Date.now();
      const diff = resetTime - now;

      expect(diff).toBeGreaterThan(86300000); // Close to 1 day
    });
  });

  describe("Concurrent Access", () => {
    it("should handle concurrent checks", async () => {
      const identifier = "user123";

      const checks = Array.from({ length: 10 }, () =>
        limiter.check(identifier)
      );

      const allowedCount = checks.filter((result) => result).length;
      expect(allowedCount).toBe(5);
    });

    it("should handle concurrent checks for different identifiers", async () => {
      const identifiers = ["user1", "user2", "user3", "user4", "user5"];

      const checks = identifiers.map((id) => limiter.check(id));

      expect(checks.every((result) => result)).toBe(true);
    });

    it("should maintain correct counts under concurrent access", () => {
      const identifier = "user123";

      for (let i = 0; i < 3; i++) {
        limiter.check(identifier);
      }

      const remaining1 = limiter.getRemaining(identifier);
      const remaining2 = limiter.getRemaining(identifier);

      expect(remaining1).toBe(remaining2);
      expect(remaining1).toBe(2);
    });
  });

  describe("Edge Cases", () => {
    it("should handle identifier with null-like names", () => {
      expect(limiter.check("null")).toBe(true);
      expect(limiter.check("undefined")).toBe(true);
      expect(limiter.check("NaN")).toBe(true);
    });

    it("should handle very long identifiers", () => {
      const longId = "a".repeat(10000);
      expect(limiter.check(longId)).toBe(true);
      expect(limiter.check(longId)).toBe(true);
    });

    it("should handle unicode identifiers", () => {
      const unicodeId = "用户123🎉";
      expect(limiter.check(unicodeId)).toBe(true);
      expect(limiter.getRemaining(unicodeId)).toBe(4);
    });

    it("should handle rapid sequential requests", () => {
      const identifier = "user123";
      const results: boolean[] = [];

      for (let i = 0; i < 10; i++) {
        results.push(limiter.check(identifier));
      }

      const allowed = results.filter((r) => r).length;
      const denied = results.filter((r) => !r).length;

      expect(allowed).toBe(5);
      expect(denied).toBe(5);
    });

    it("should handle requests at exact window boundary", async () => {
      const shortLimiter = new InMemoryRateLimiter({
        maxRequests: 2,
        windowMs: 50,
      });
      const identifier = "user123";

      shortLimiter.check(identifier);
      shortLimiter.check(identifier);

      // Wait exactly window duration
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(shortLimiter.check(identifier)).toBe(true);
    });

    it("should not leak memory with many identifiers", () => {
      for (let i = 0; i < 10000; i++) {
        limiter.check(`user${i}`);
      }

      limiter.cleanup();
      limiter.resetAll();

      expect(limiter.getRemaining("user0")).toBe(5);
    });

    it("should handle same identifier checked multiple times in quick succession", () => {
      const identifier = "user123";

      const result1 = limiter.check(identifier);
      const result2 = limiter.check(identifier);
      const result3 = limiter.check(identifier);
      const result4 = limiter.check(identifier);
      const result5 = limiter.check(identifier);
      const result6 = limiter.check(identifier);

      expect([result1, result2, result3, result4, result5]).toEqual([
        true,
        true,
        true,
        true,
        true,
      ]);
      expect(result6).toBe(false);
    });
  });

  describe("Stats and Monitoring", () => {
    it("should track total requests accurately", () => {
      limiter.check("user1");
      limiter.check("user1");
      limiter.check("user2");
      limiter.check("user3");

      expect(limiter.getRemaining("user1")).toBe(3);
      expect(limiter.getRemaining("user2")).toBe(4);
      expect(limiter.getRemaining("user3")).toBe(4);
    });

    it("should provide accurate remaining count", () => {
      const identifier = "user123";

      expect(limiter.getRemaining(identifier)).toBe(5);
      limiter.check(identifier);
      expect(limiter.getRemaining(identifier)).toBe(4);
      limiter.check(identifier);
      expect(limiter.getRemaining(identifier)).toBe(3);
      limiter.check(identifier);
      expect(limiter.getRemaining(identifier)).toBe(2);
    });

    it("should provide correct reset time information", () => {
      const identifier = "user123";
      const before = Date.now();

      limiter.check(identifier);

      const resetTime = limiter.getResetTime(identifier);
      const expectedReset = before + 1000;

      expect(resetTime).toBeGreaterThanOrEqual(expectedReset - 10);
      expect(resetTime).toBeLessThanOrEqual(expectedReset + 10);
    });
  });

  describe("Integration Scenarios", () => {
    it("should simulate typical API rate limiting", async () => {
      const apiLimiter = new InMemoryRateLimiter({
        maxRequests: 100,
        windowMs: 60000,
      });
      const userId = "api-user-123";

      // Simulate 100 requests
      for (let i = 0; i < 100; i++) {
        expect(apiLimiter.check(userId)).toBe(true);
      }

      // 101st request should fail
      expect(apiLimiter.check(userId)).toBe(false);
      expect(apiLimiter.getRemaining(userId)).toBe(0);
    });

    it("should simulate IP-based rate limiting", () => {
      const ipLimiter = new InMemoryRateLimiter({
        maxRequests: 10,
        windowMs: 1000,
      });
      const ip = "192.168.1.100";

      for (let i = 0; i < 10; i++) {
        expect(ipLimiter.check(ip)).toBe(true);
      }

      expect(ipLimiter.check(ip)).toBe(false);
    });

    it("should simulate burst protection", async () => {
      const burstLimiter = new InMemoryRateLimiter({
        maxRequests: 5,
        windowMs: 100,
      });
      const user = "burst-user";

      // Rapid burst
      for (let i = 0; i < 5; i++) {
        expect(burstLimiter.check(user)).toBe(true);
      }

      expect(burstLimiter.check(user)).toBe(false);

      // Wait for window
      await new Promise((resolve) => setTimeout(resolve, 110));

      // Should allow again
      expect(burstLimiter.check(user)).toBe(true);
    });

    it("should simulate multi-tier rate limiting", () => {
      const freeTier = new InMemoryRateLimiter({
        maxRequests: 10,
        windowMs: 60000,
      });
      const premiumTier = new InMemoryRateLimiter({
        maxRequests: 100,
        windowMs: 60000,
      });

      const freeUser = "free-user";
      const premiumUser = "premium-user";

      // Free user hits limit quickly
      for (let i = 0; i < 10; i++) {
        freeTier.check(freeUser);
      }
      expect(freeTier.check(freeUser)).toBe(false);

      // Premium user has more headroom
      for (let i = 0; i < 50; i++) {
        premiumTier.check(premiumUser);
      }
      expect(premiumTier.check(premiumUser)).toBe(true);
      expect(premiumTier.getRemaining(premiumUser)).toBe(49);
    });
  });
});

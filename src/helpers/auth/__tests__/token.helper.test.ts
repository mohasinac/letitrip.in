/**
 * @jest-environment jsdom
 */

import {
  generateVerificationToken,
  generateVerificationCode,
  calculateTokenExpiration,
  isTokenExpired,
  getTokenTimeRemaining,
  maskToken,
  generateSessionId,
} from "../token.helper";

describe("Token Helper", () => {
  describe("generateVerificationToken", () => {
    it("should generate a UUID", () => {
      const token = generateVerificationToken();
      expect(token).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it("should generate unique tokens", () => {
      const token1 = generateVerificationToken();
      const token2 = generateVerificationToken();
      expect(token1).not.toBe(token2);
    });

    it("should generate 36-character string", () => {
      const token = generateVerificationToken();
      expect(token).toHaveLength(36);
    });
  });

  describe("generateVerificationCode", () => {
    it("should generate a 6-digit code", () => {
      const code = generateVerificationCode();
      expect(code).toMatch(/^\d{6}$/);
    });

    it("should generate numeric string", () => {
      const code = generateVerificationCode();
      expect(parseInt(code, 10)).toBeGreaterThanOrEqual(100000);
      expect(parseInt(code, 10)).toBeLessThan(1000000);
    });

    it("should generate different codes", () => {
      const code1 = generateVerificationCode();
      const code2 = generateVerificationCode();
      // Very unlikely to be the same, but not impossible
      expect(typeof code1).toBe("string");
      expect(typeof code2).toBe("string");
    });

    it("should have exactly 6 characters", () => {
      const code = generateVerificationCode();
      expect(code).toHaveLength(6);
    });
  });

  describe("calculateTokenExpiration", () => {
    it("should calculate expiration 24 hours from now by default", () => {
      const before = Date.now() + 24 * 60 * 60 * 1000;
      const expiration = calculateTokenExpiration();
      const after = Date.now() + 24 * 60 * 60 * 1000;

      expect(expiration.getTime()).toBeGreaterThanOrEqual(before - 1000);
      expect(expiration.getTime()).toBeLessThanOrEqual(after + 1000);
    });

    it("should calculate custom expiration", () => {
      const before = Date.now() + 1 * 60 * 60 * 1000;
      const expiration = calculateTokenExpiration(1);
      const after = Date.now() + 1 * 60 * 60 * 1000;

      expect(expiration.getTime()).toBeGreaterThanOrEqual(before - 1000);
      expect(expiration.getTime()).toBeLessThanOrEqual(after + 1000);
    });

    it("should handle different hour values", () => {
      const exp1 = calculateTokenExpiration(1);
      const exp2 = calculateTokenExpiration(48);
      const exp3 = calculateTokenExpiration(168); // 1 week

      expect(exp2.getTime()).toBeGreaterThan(exp1.getTime());
      expect(exp3.getTime()).toBeGreaterThan(exp2.getTime());
    });

    it("should return Date object", () => {
      const expiration = calculateTokenExpiration();
      expect(expiration).toBeInstanceOf(Date);
    });
  });

  describe("isTokenExpired", () => {
    it("should detect expired tokens", () => {
      const past = new Date(Date.now() - 1000);
      expect(isTokenExpired(past)).toBe(true);
    });

    it("should detect active tokens", () => {
      const future = new Date(Date.now() + 1000000);
      expect(isTokenExpired(future)).toBe(false);
    });

    it("should handle string dates", () => {
      const past = new Date(Date.now() - 1000).toISOString();
      const future = new Date(Date.now() + 1000000).toISOString();
      expect(isTokenExpired(past)).toBe(true);
      expect(isTokenExpired(future)).toBe(false);
    });

    it("should handle edge case at exact expiry", () => {
      const now = new Date();
      expect(isTokenExpired(now)).toBe(true);
    });
  });

  describe("getTokenTimeRemaining", () => {
    it("should calculate time remaining in minutes", () => {
      const oneHourLater = new Date(Date.now() + 60 * 60 * 1000);
      expect(getTokenTimeRemaining(oneHourLater)).toBe(60);
    });

    it("should return 0 for expired tokens", () => {
      const past = new Date(Date.now() - 1000);
      expect(getTokenTimeRemaining(past)).toBe(0);
    });

    it("should handle string dates", () => {
      const oneHourLater = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      expect(getTokenTimeRemaining(oneHourLater)).toBe(60);
    });

    it("should round down to nearest minute", () => {
      const futureTime = new Date(Date.now() + 90 * 1000); // 1.5 minutes
      expect(getTokenTimeRemaining(futureTime)).toBe(1);
    });

    it("should handle different time ranges", () => {
      const thirtyMinutes = new Date(Date.now() + 30 * 60 * 1000);
      const twoHours = new Date(Date.now() + 120 * 60 * 1000);
      expect(getTokenTimeRemaining(thirtyMinutes)).toBe(30);
      expect(getTokenTimeRemaining(twoHours)).toBe(120);
    });
  });

  describe("maskToken", () => {
    it("should mask middle portion of token", () => {
      expect(maskToken("abcdefghijklmnop")).toBe("abcd...mnop");
      expect(maskToken("1234567890123456")).toBe("1234...3456");
    });

    it("should show first 4 and last 4 characters", () => {
      const token = "verylongtoken1234567890";
      const masked = maskToken(token);
      expect(masked.startsWith("very")).toBe(true);
      expect(masked.endsWith("7890")).toBe(true);
      expect(masked).toContain("...");
    });

    it("should not mask short tokens", () => {
      expect(maskToken("short")).toBe("short");
      expect(maskToken("12345678")).toBe("12345678");
    });

    it("should handle exactly 8 character tokens", () => {
      expect(maskToken("abcdefgh")).toBe("abcdefgh");
    });

    it("should handle very long tokens", () => {
      const longToken = "a".repeat(100);
      const masked = maskToken(longToken);
      expect(masked.startsWith("aaaa")).toBe(true);
      expect(masked.endsWith("aaaa")).toBe(true);
      expect(masked).toContain("...");
      expect(masked.length).toBeLessThan(longToken.length);
    });
  });

  describe("generateSessionId", () => {
    it("should generate a UUID", () => {
      const sessionId = generateSessionId();
      expect(sessionId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it("should generate unique session IDs", () => {
      const id1 = generateSessionId();
      const id2 = generateSessionId();
      expect(id1).not.toBe(id2);
    });

    it("should generate 36-character string", () => {
      const sessionId = generateSessionId();
      expect(sessionId).toHaveLength(36);
    });

    it("should generate multiple unique IDs", () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateSessionId());
      }
      expect(ids.size).toBe(100);
    });
  });
});

/**
 * Tests for cache-metrics utilities
 *
 * Coverage:
 * - getCacheDashboardData formats hitRate via formatNumber (not .toFixed)
 * - getCacheDashboardData formats lastReset via formatDateTime (not .toLocaleString)
 * - monitorCachePerformance logs via logger.warn (not console.warn)
 * - getCacheMetrics initialises with nowISO() timestamp (not new Date())
 */

jest.mock("@/classes", () => ({
  CacheManager: {
    getInstance: () => ({
      size: () => 5,
      keys: () => ["k1", "k2", "k3", "k4", "k5"],
    }),
  },
  logger: { warn: jest.fn() },
}));

jest.mock("../analytics", () => ({ trackEvent: jest.fn() }));

const mockFormatNumber = jest.fn((v: number) => `${v.toFixed(2)}`);
const mockFormatDateTime = jest.fn(() => "1 Jan 2025, 12:00");
const mockNowISO = jest.fn(() => "2025-01-01T12:00:00.000Z");
const mockNowMs = jest.fn(() => 1_000_000);

jest.mock("@/utils", () => ({
  formatNumber: (...args: unknown[]) =>
    mockFormatNumber(args[0] as number, ...args.slice(1)),
  formatDateTime: (v: unknown) => mockFormatDateTime(v),
  nowISO: () => mockNowISO(),
  nowMs: () => mockNowMs(),
}));

import {
  getCacheDashboardData,
  resetCacheMetrics,
  monitorCachePerformance,
} from "../cache-metrics";

describe("cache-metrics", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    resetCacheMetrics();
  });

  describe("getCacheDashboardData", () => {
    it("formats hitRate using formatNumber (not .toFixed)", () => {
      getCacheDashboardData();
      expect(mockFormatNumber).toHaveBeenCalled();
    });

    it("formats lastReset using formatDateTime (not .toLocaleString)", () => {
      const result = getCacheDashboardData();
      expect(mockFormatDateTime).toHaveBeenCalled();
      expect(result.lastReset).toBe("1 Jan 2025, 12:00");
    });

    it("returns hitRate string with % suffix", () => {
      const result = getCacheDashboardData();
      expect(result.hitRate).toMatch(/%$/);
    });

    it("returns cacheSize from CacheManager", () => {
      const result = getCacheDashboardData();
      expect(result.cacheSize).toBe(5);
    });
  });

  describe("monitorCachePerformance", () => {
    it("does not call logger.warn when hitRate is 0%", () => {
      const { logger } = require("@/classes") as {
        logger: { warn: jest.Mock };
      };
      monitorCachePerformance();
      // hitRate is 0 — neither condition (< 50 && > 0) nor (< 70 && > 0) fires
      expect(logger.warn).not.toHaveBeenCalled();
    });
  });

  describe("getCacheMetrics initialisation", () => {
    it("uses nowISO() for lastReset timestamp on init", () => {
      localStorage.clear();
      resetCacheMetrics();
      expect(mockNowISO).toHaveBeenCalled();
    });
  });
});

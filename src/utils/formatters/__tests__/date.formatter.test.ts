/**
 * @jest-environment jsdom
 */

import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatDateRange,
} from "../date.formatter";

describe("Date Formatter", () => {
  describe("formatDate", () => {
    it("should format dates in short format", () => {
      const date = new Date("2026-02-07T10:30:00Z");
      const formatted = formatDate(date, "short");
      expect(formatted).toMatch(/2\/7\/26|7\/2\/26/); // Depends on locale
    });

    it("should format dates in medium format", () => {
      const date = new Date("2026-02-07T10:30:00Z");
      const formatted = formatDate(date, "medium");
      expect(formatted).toContain("Feb");
      expect(formatted).toContain("2026");
    });

    it("should format dates in long format", () => {
      const date = new Date("2026-02-07T10:30:00Z");
      const formatted = formatDate(date, "long");
      expect(formatted).toContain("February");
      expect(formatted).toContain("2026");
    });

    it("should format dates in full format", () => {
      const date = new Date("2026-02-07T10:30:00Z");
      const formatted = formatDate(date, "full");
      expect(formatted).toContain("2026");
      expect(formatted.length).toBeGreaterThan(20); // Full includes day of week
    });

    it("should handle string dates", () => {
      const formatted = formatDate("2026-02-07", "medium");
      expect(formatted).toContain("2026");
    });

    it("should use medium format by default", () => {
      const date = new Date("2026-02-07T10:30:00Z");
      const formatted = formatDate(date);
      expect(formatted).toContain("2026");
    });
  });

  describe("formatDateTime", () => {
    it("should format date and time", () => {
      const date = new Date("2026-02-07T15:45:30Z");
      const formatted = formatDateTime(date);
      expect(formatted).toContain("2026");
      expect(formatted).toMatch(/\d{1,2}:\d{2}/); // Contains time
    });

    it("should include seconds when requested", () => {
      const date = new Date("2026-02-07T15:45:30Z");
      const formatted = formatDateTime(date, "en-US");
      expect(formatted).toMatch(/\d{1,2}:\d{2}/); // Contains time
    });

    it("should handle string dates", () => {
      const formatted = formatDateTime("2026-02-07T15:45:30Z");
      expect(formatted).toContain("2026");
    });
  });

  describe("formatRelativeTime", () => {
    it("should format just now", () => {
      const now = new Date();
      expect(formatRelativeTime(now)).toBe("just now");
    });

    it("should format minutes ago", () => {
      const date = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
      expect(formatRelativeTime(date)).toBe("5 minutes ago");
    });

    it("should format hours ago", () => {
      const date = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
      expect(formatRelativeTime(date)).toBe("2 hours ago");
    });

    it("should format days ago", () => {
      const date = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
      expect(formatRelativeTime(date)).toBe("3 days ago");
    });

    it("should format months ago", () => {
      const date = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000); // ~2 months ago
      expect(formatRelativeTime(date)).toContain("months ago");
    });

    it("should handle singular units", () => {
      const date = new Date(Date.now() - 60 * 1000); // 1 minute ago
      expect(formatRelativeTime(date)).toBe("1 minute ago");
    });

    it("should handle string dates", () => {
      const date = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      expect(formatRelativeTime(date)).toContain("minutes ago");
    });
  });

  describe("formatDateRange", () => {
    it("should format date ranges in same month", () => {
      const start = new Date("2026-02-07");
      const end = new Date("2026-02-15");
      const formatted = formatDateRange(start, end);
      expect(formatted).toContain("Feb");
      expect(formatted).toContain("7");
      expect(formatted).toContain("15");
    });

    it("should format date ranges across months", () => {
      const start = new Date("2026-02-28");
      const end = new Date("2026-03-05");
      const formatted = formatDateRange(start, end);
      expect(formatted).toContain("Feb");
      expect(formatted).toContain("Mar");
    });

    it("should format date ranges across years", () => {
      const start = new Date("2025-12-20");
      const end = new Date("2026-01-10");
      const formatted = formatDateRange(start, end);
      expect(formatted).toContain("2025");
      expect(formatted).toContain("2026");
    });

    it("should handle string dates", () => {
      const formatted = formatDateRange("2026-02-07", "2026-02-15");
      expect(formatted).toContain("2026");
    });
  });
});

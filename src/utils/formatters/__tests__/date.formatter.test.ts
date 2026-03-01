/**
 * @jest-environment jsdom
 */

import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatDateRange,
  nowMs,
  isSameMonth,
  currentYear,
  nowISO,
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

    it("should handle different formats", () => {
      const date = new Date("2026-02-07T15:45:30Z");
      const formatted = formatDateTime(date, "long");
      expect(formatted).toMatch(/\d{1,2}:\d{2}/); // Contains time
    });

    it("should handle string dates", () => {
      const formatted = formatDateTime("2026-02-07T15:45:30Z");
      expect(formatted).toContain("2026");
    });

    it("should handle numeric timestamps (ms epoch)", () => {
      const ts = new Date("2026-02-07T15:45:30Z").getTime();
      const formatted = formatDateTime(ts);
      expect(formatted).toContain("2026");
      expect(formatted).toMatch(/\d{1,2}:\d{2}/);
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

  describe("nowMs", () => {
    it("returns a number close to Date.now()", () => {
      const before = Date.now();
      const result = nowMs();
      const after = Date.now();
      expect(result).toBeGreaterThanOrEqual(before);
      expect(result).toBeLessThanOrEqual(after);
    });
  });

  describe("isSameMonth", () => {
    it("returns true for dates in the same month and year", () => {
      expect(isSameMonth(new Date("2026-03-01"), new Date("2026-03-31"))).toBe(
        true,
      );
    });

    it("returns false for dates in different months", () => {
      expect(isSameMonth(new Date("2026-03-01"), new Date("2026-04-01"))).toBe(
        false,
      );
    });

    it("returns false for same month different year", () => {
      expect(isSameMonth(new Date("2025-03-01"), new Date("2026-03-01"))).toBe(
        false,
      );
    });

    it("accepts numeric timestamps", () => {
      const a = new Date("2026-03-15").getTime();
      const b = new Date("2026-03-20").getTime();
      expect(isSameMonth(a, b)).toBe(true);
    });
  });

  describe("currentYear", () => {
    it("returns the current 4-digit year as a string", () => {
      const year = currentYear();
      expect(year).toMatch(/^\d{4}$/);
      expect(year).toBe(new Date().getFullYear().toString());
    });
  });

  describe("nowISO", () => {
    it("returns an ISO 8601 string", () => {
      const iso = nowISO();
      expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it("is close to current time", () => {
      const before = new Date().toISOString();
      const iso = nowISO();
      expect(iso >= before).toBe(true);
    });
  });
});

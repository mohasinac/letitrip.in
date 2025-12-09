/**
 * Comprehensive Date Utils Test Suite
 *
 * Tests edge cases, Firestore timestamp handling, timezone issues, and date validation.
 * Focuses on null safety, invalid date handling, and real-world date parsing scenarios.
 *
 * Testing Focus:
 * - Firestore Timestamp conversion
 * - Invalid date handling (NaN, undefined, malformed)
 * - Timezone and DST edge cases
 * - Leap year and date boundaries
 * - Date input formatting for HTML forms
 * - Performance with various date formats
 */

import {
  getTodayDateInputValue,
  isValidDate,
  safeToDate,
  safeToISOString,
  toDateInputValue,
  toISOStringOrDefault,
} from "../date-utils";

describe("Date Utils - Comprehensive Edge Cases", () => {
  describe("safeToISOString - ISO String Conversion", () => {
    describe("valid date inputs", () => {
      it("converts Date objects to ISO string", () => {
        const date = new Date("2024-01-15T10:30:00Z");
        expect(safeToISOString(date)).toBe("2024-01-15T10:30:00.000Z");
      });

      it("converts ISO string to ISO string (normalizes)", () => {
        expect(safeToISOString("2024-01-15T10:30:00Z")).toBe(
          "2024-01-15T10:30:00.000Z"
        );
        expect(safeToISOString("2024-01-15T10:30:00.123Z")).toBe(
          "2024-01-15T10:30:00.123Z"
        );
      });

      it("converts timestamp numbers to ISO string", () => {
        const timestamp = new Date("2024-01-15T10:30:00Z").getTime();
        expect(safeToISOString(timestamp)).toBe("2024-01-15T10:30:00.000Z");
      });

      it("handles various date string formats", () => {
        expect(safeToISOString("2024-01-15")).toBeTruthy();
        expect(safeToISOString("2024/01/15")).toBeTruthy();
        expect(safeToISOString("Jan 15, 2024")).toBeTruthy();
        expect(safeToISOString("15 Jan 2024")).toBeTruthy();
      });

      it("handles dates with timezone offsets", () => {
        expect(safeToISOString("2024-01-15T10:30:00+05:30")).toBeTruthy();
        expect(safeToISOString("2024-01-15T10:30:00-08:00")).toBeTruthy();
      });

      it("rejects epoch time (0) - falsy value guard", () => {
        // NOTE: Implementation treats 0 as falsy and returns null
        // This prevents handling timestamp 0 (epoch)
        expect(safeToISOString(0)).toBeNull();
      });

      it("handles very old dates", () => {
        const oldDate = new Date("1900-01-01T00:00:00Z");
        expect(safeToISOString(oldDate)).toBe("1900-01-01T00:00:00.000Z");
      });

      it("handles future dates", () => {
        const futureDate = new Date("2099-12-31T23:59:59Z");
        expect(safeToISOString(futureDate)).toBe("2099-12-31T23:59:59.000Z");
      });
    });

    describe("Firestore Timestamp handling", () => {
      it("converts Firestore Timestamp with seconds", () => {
        const firestoreTimestamp = {
          seconds: 1705318200,
          nanoseconds: 0,
        };
        const result = safeToISOString(firestoreTimestamp);
        expect(result).toBeTruthy();
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      });

      it("handles Firestore Timestamp with nanoseconds", () => {
        const firestoreTimestamp = {
          seconds: 1705318200,
          nanoseconds: 123456789,
        };
        const result = safeToISOString(firestoreTimestamp);
        expect(result).toBeTruthy();
        // JavaScript Date doesn't support nanosecond precision, so they're ignored
      });

      it("handles Firestore Timestamp at epoch", () => {
        const firestoreTimestamp = {
          seconds: 0,
          nanoseconds: 0,
        };
        expect(safeToISOString(firestoreTimestamp)).toBe(
          "1970-01-01T00:00:00.000Z"
        );
      });

      it("handles Firestore Timestamp with negative seconds (before epoch)", () => {
        const firestoreTimestamp = {
          seconds: -86400, // 1 day before epoch
          nanoseconds: 0,
        };
        const result = safeToISOString(firestoreTimestamp);
        expect(result).toBe("1969-12-31T00:00:00.000Z");
      });

      it("rejects invalid Firestore Timestamp (NaN seconds)", () => {
        const firestoreTimestamp = {
          seconds: NaN,
          nanoseconds: 0,
        };
        expect(safeToISOString(firestoreTimestamp)).toBeNull();
      });

      it("rejects object with seconds property but wrong type", () => {
        const invalidTimestamp = {
          seconds: "not a number",
          nanoseconds: 0,
        };
        expect(safeToISOString(invalidTimestamp)).toBeNull();
      });
    });

    describe("null safety", () => {
      it("returns null for null", () => {
        expect(safeToISOString(null)).toBeNull();
      });

      it("returns null for undefined", () => {
        expect(safeToISOString(undefined)).toBeNull();
      });

      it("returns null for empty string", () => {
        expect(safeToISOString("")).toBeNull();
      });

      it("returns null for NaN", () => {
        expect(safeToISOString(NaN)).toBeNull();
      });

      it("returns null for Infinity", () => {
        expect(safeToISOString(Infinity)).toBeNull();
      });

      it("returns null for Invalid Date object", () => {
        expect(safeToISOString(new Date("invalid"))).toBeNull();
      });
    });

    describe("invalid date strings", () => {
      it("returns null for completely invalid strings", () => {
        expect(safeToISOString("not a date")).toBeNull();
        expect(safeToISOString("abc123")).toBeNull();
        expect(safeToISOString("hello world")).toBeNull();
      });

      it("handles malformed date strings - JavaScript Date coercion", () => {
        // NOTE: JavaScript Date auto-corrects invalid dates
        expect(safeToISOString("2024-13-01")).toBeNull(); // Month 13 -> Invalid
        expect(safeToISOString("2024-01-32")).toBeNull(); // Day 32 -> Invalid
        // Feb 30 -> March 1 (JavaScript auto-rolls over)
        expect(safeToISOString("2024-02-30")).toBe("2024-03-01T00:00:00.000Z");
      });

      it("returns null for out-of-range dates", () => {
        // JavaScript Date can handle very large timestamps
        // But some values cause Invalid Date
        expect(safeToISOString("9999999999999999")).toBeNull();
      });

      it("handles edge case date strings", () => {
        expect(safeToISOString("0000-00-00")).toBeNull();
        expect(safeToISOString("0001-01-01")).toBeTruthy(); // Year 1 is valid
      });
    });

    describe("edge cases", () => {
      it("handles leap year dates - JavaScript auto-correction", () => {
        expect(safeToISOString("2024-02-29")).toBeTruthy(); // 2024 is leap year
        // NOTE: Feb 29, 2023 -> March 1, 2023 (JavaScript auto-corrects)
        expect(safeToISOString("2023-02-29")).toBe("2023-03-01T00:00:00.000Z");
      });

      it("handles DST transitions", () => {
        // Spring forward - 2:00 AM becomes 3:00 AM
        expect(safeToISOString("2024-03-10T02:30:00-05:00")).toBeTruthy();
        // Fall back - 2:00 AM happens twice
        expect(safeToISOString("2024-11-03T02:30:00-04:00")).toBeTruthy();
      });

      it("handles midnight and end of day", () => {
        expect(safeToISOString("2024-01-01T00:00:00Z")).toBe(
          "2024-01-01T00:00:00.000Z"
        );
        expect(safeToISOString("2024-01-01T23:59:59Z")).toBe(
          "2024-01-01T23:59:59.000Z"
        );
      });

      it("handles month boundaries - JavaScript date overflow", () => {
        expect(safeToISOString("2024-01-31")).toBeTruthy(); // Jan has 31 days
        // NOTE: April 31 -> May 1 (JavaScript overflows to next month)
        expect(safeToISOString("2024-04-31")).toBe("2024-05-01T00:00:00.000Z");
      });

      it("handles boolean inputs - falsy guard behavior", () => {
        // true -> 1 -> valid timestamp (1ms after epoch)
        expect(safeToISOString(true)).toBe("1970-01-01T00:00:00.001Z");
        // NOTE: false is falsy, caught by `if (!date)` guard
        expect(safeToISOString(false)).toBeNull();
      });

      it("handles array inputs", () => {
        expect(safeToISOString([])).toBeNull();
        expect(safeToISOString([2024, 0, 15])).toBeNull(); // Arrays don't convert well
      });

      it("handles object inputs without seconds property", () => {
        expect(safeToISOString({ invalid: "object" })).toBeNull();
        expect(safeToISOString({})).toBeNull();
      });
    });
  });

  describe("toISOStringOrDefault - ISO String with Fallback", () => {
    describe("valid dates", () => {
      it("converts valid date to ISO string", () => {
        const date = new Date("2024-01-15T10:30:00Z");
        expect(toISOStringOrDefault(date)).toBe("2024-01-15T10:30:00.000Z");
      });

      it("converts valid string to ISO string", () => {
        expect(toISOStringOrDefault("2024-01-15T10:30:00Z")).toBe(
          "2024-01-15T10:30:00.000Z"
        );
      });

      it("converts timestamp to ISO string", () => {
        const timestamp = new Date("2024-01-15T10:30:00Z").getTime();
        expect(toISOStringOrDefault(timestamp)).toBe(
          "2024-01-15T10:30:00.000Z"
        );
      });
    });

    describe("fallback behavior", () => {
      it("returns current date ISO string for null", () => {
        const result = toISOStringOrDefault(null);
        expect(result).toBeTruthy();
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

        // Result should be close to now
        const resultDate = new Date(result);
        const now = new Date();
        const diffMs = Math.abs(now.getTime() - resultDate.getTime());
        expect(diffMs).toBeLessThan(1000); // Within 1 second
      });

      it("returns current date ISO string for undefined", () => {
        const result = toISOStringOrDefault(undefined);
        expect(result).toBeTruthy();
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      });

      it("returns current date ISO string for invalid date", () => {
        const result = toISOStringOrDefault("invalid-date");
        expect(result).toBeTruthy();
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      });

      it("uses custom fallback date", () => {
        const fallback = new Date("2023-01-01T00:00:00Z");
        const result = toISOStringOrDefault(null, fallback);
        expect(result).toBe("2023-01-01T00:00:00.000Z");
      });

      it("uses custom fallback for NaN", () => {
        const fallback = new Date("2023-06-15T12:00:00Z");
        const result = toISOStringOrDefault(NaN, fallback);
        expect(result).toBe("2023-06-15T12:00:00.000Z");
      });

      it("uses custom fallback for Invalid Date", () => {
        const fallback = new Date("2023-12-25T00:00:00Z");
        const result = toISOStringOrDefault(new Date("invalid"), fallback);
        expect(result).toBe("2023-12-25T00:00:00.000Z");
      });
    });

    describe("edge cases", () => {
      it("handles empty string with fallback", () => {
        const fallback = new Date("2024-01-01T00:00:00Z");
        const result = toISOStringOrDefault("", fallback);
        expect(result).toBe("2024-01-01T00:00:00.000Z");
      });

      it("handles Firestore Timestamp with fallback", () => {
        const firestoreTimestamp = {
          seconds: 1705318200,
          nanoseconds: 0,
        };
        const result = toISOStringOrDefault(firestoreTimestamp);
        expect(result).toBeTruthy();
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      });

      it("never returns null (always has fallback)", () => {
        expect(toISOStringOrDefault(null)).not.toBeNull();
        expect(toISOStringOrDefault(undefined)).not.toBeNull();
        expect(toISOStringOrDefault("invalid")).not.toBeNull();
        expect(toISOStringOrDefault(NaN)).not.toBeNull();
      });
    });
  });

  describe("isValidDate - Date Validation", () => {
    describe("valid dates", () => {
      it("returns true for valid Date objects", () => {
        expect(isValidDate(new Date("2024-01-15T10:30:00Z"))).toBe(true);
        expect(isValidDate(new Date())).toBe(true);
      });

      it("returns true for valid date strings", () => {
        expect(isValidDate("2024-01-15T10:30:00Z")).toBe(true);
        expect(isValidDate("2024-01-15")).toBe(true);
        expect(isValidDate("Jan 15, 2024")).toBe(true);
      });

      it("returns true for valid timestamps (except falsy values)", () => {
        const timestamp = new Date("2024-01-15T10:30:00Z").getTime();
        expect(isValidDate(timestamp)).toBe(true);
        // NOTE: 0 is falsy, caught by `if (!date)` guard
        expect(isValidDate(0)).toBe(false);
      });

      it("returns true for Firestore Timestamps", () => {
        const firestoreTimestamp = {
          seconds: 1705318200,
          nanoseconds: 0,
        };
        expect(isValidDate(firestoreTimestamp)).toBe(true);
      });

      it("returns true for negative timestamps (before epoch)", () => {
        expect(isValidDate(-86400000)).toBe(true); // 1 day before epoch
      });
    });

    describe("invalid dates", () => {
      it("returns false for null", () => {
        expect(isValidDate(null)).toBe(false);
      });

      it("returns false for undefined", () => {
        expect(isValidDate(undefined)).toBe(false);
      });

      it("returns false for empty string", () => {
        expect(isValidDate("")).toBe(false);
      });

      it("returns false for NaN", () => {
        expect(isValidDate(NaN)).toBe(false);
      });

      it("returns false for Infinity", () => {
        expect(isValidDate(Infinity)).toBe(false);
      });

      it("returns false for Invalid Date object", () => {
        expect(isValidDate(new Date("invalid"))).toBe(false);
      });

      it("returns false for invalid date strings (with auto-correction caveat)", () => {
        expect(isValidDate("not a date")).toBe(false);
        expect(isValidDate("2024-13-01")).toBe(false);
        // NOTE: JavaScript auto-corrects Feb 30 -> March 1
        expect(isValidDate("2024-02-30")).toBe(true);
      });

      it("returns false for objects without proper structure", () => {
        expect(isValidDate({ invalid: "object" })).toBe(false);
        expect(isValidDate({})).toBe(false);
      });

      it("returns false for arrays", () => {
        expect(isValidDate([])).toBe(false);
        expect(isValidDate([2024, 0, 15])).toBe(false);
      });
    });

    describe("edge cases", () => {
      it("handles boolean inputs - falsy guard", () => {
        expect(isValidDate(true)).toBe(true); // true -> 1 -> valid timestamp
        // NOTE: false is falsy, caught by `if (!date)` guard
        expect(isValidDate(false)).toBe(false);
      });

      it("handles leap year dates - JavaScript auto-correction", () => {
        expect(isValidDate("2024-02-29")).toBe(true); // Valid leap year
        // NOTE: JavaScript auto-corrects Feb 29, 2023 -> March 1, 2023
        expect(isValidDate("2023-02-29")).toBe(true);
      });

      it("handles Firestore Timestamp with invalid seconds", () => {
        const invalidTimestamp = {
          seconds: NaN,
          nanoseconds: 0,
        };
        expect(isValidDate(invalidTimestamp)).toBe(false);
      });
    });
  });

  describe("safeToDate - Date Object Conversion", () => {
    describe("valid conversions", () => {
      it("returns Date object for valid Date input", () => {
        const date = new Date("2024-01-15T10:30:00Z");
        const result = safeToDate(date);
        expect(result).toBeInstanceOf(Date);
        expect(result?.toISOString()).toBe("2024-01-15T10:30:00.000Z");
      });

      it("converts string to Date object", () => {
        const result = safeToDate("2024-01-15T10:30:00Z");
        expect(result).toBeInstanceOf(Date);
        expect(result?.toISOString()).toBe("2024-01-15T10:30:00.000Z");
      });

      it("converts timestamp to Date object", () => {
        const timestamp = new Date("2024-01-15T10:30:00Z").getTime();
        const result = safeToDate(timestamp);
        expect(result).toBeInstanceOf(Date);
        expect(result?.toISOString()).toBe("2024-01-15T10:30:00.000Z");
      });

      it("converts Firestore Timestamp to Date object", () => {
        const firestoreTimestamp = {
          seconds: 1705318200,
          nanoseconds: 0,
        };
        const result = safeToDate(firestoreTimestamp);
        expect(result).toBeInstanceOf(Date);
        expect(result).toBeTruthy();
      });
    });

    describe("null safety", () => {
      it("returns null for null", () => {
        expect(safeToDate(null)).toBeNull();
      });

      it("returns null for undefined", () => {
        expect(safeToDate(undefined)).toBeNull();
      });

      it("returns null for empty string", () => {
        expect(safeToDate("")).toBeNull();
      });

      it("returns null for NaN", () => {
        expect(safeToDate(NaN)).toBeNull();
      });

      it("returns null for Infinity", () => {
        expect(safeToDate(Infinity)).toBeNull();
      });

      it("returns null for Invalid Date", () => {
        expect(safeToDate(new Date("invalid"))).toBeNull();
      });

      it("returns null for invalid strings", () => {
        expect(safeToDate("not a date")).toBeNull();
        expect(safeToDate("2024-13-01")).toBeNull();
      });
    });

    describe("edge cases", () => {
      it("rejects epoch time (0) - falsy value guard", () => {
        // NOTE: 0 is falsy, caught by `if (!date)` guard
        const result = safeToDate(0);
        expect(result).toBeNull();
      });

      it("handles negative timestamps", () => {
        const result = safeToDate(-86400000);
        expect(result).toBeInstanceOf(Date);
        expect(result?.toISOString()).toBe("1969-12-31T00:00:00.000Z");
      });

      it("handles Firestore Timestamp with nanoseconds", () => {
        const firestoreTimestamp = {
          seconds: 1705318200,
          nanoseconds: 123456789,
        };
        const result = safeToDate(firestoreTimestamp);
        expect(result).toBeInstanceOf(Date);
        // Nanoseconds are ignored by JavaScript Date
      });
    });
  });

  describe("toDateInputValue - HTML Date Input Formatting", () => {
    it("formats Date object to YYYY-MM-DD", () => {
      const date = new Date("2024-01-15T10:30:00Z");
      const result = toDateInputValue(date);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(result).toBe("2024-01-15");
    });

    it("formats string date to YYYY-MM-DD", () => {
      const result = toDateInputValue("2024-01-15T10:30:00Z");
      expect(result).toBe("2024-01-15");
    });

    it("formats timestamp to YYYY-MM-DD", () => {
      const timestamp = new Date("2024-01-15T10:30:00Z").getTime();
      const result = toDateInputValue(timestamp);
      expect(result).toBe("2024-01-15");
    });

    it("returns empty string for invalid date", () => {
      expect(toDateInputValue("invalid")).toBe("");
      expect(toDateInputValue(null)).toBe("");
      expect(toDateInputValue(undefined)).toBe("");
      expect(toDateInputValue(NaN)).toBe("");
    });

    it("pads single-digit months and days", () => {
      const date = new Date("2024-01-05T00:00:00Z");
      const result = toDateInputValue(date);
      expect(result).toBe("2024-01-05");
    });

    it("handles Firestore Timestamp", () => {
      const firestoreTimestamp = {
        seconds: 1705318200,
        nanoseconds: 0,
      };
      const result = toDateInputValue(firestoreTimestamp);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe("getTodayDateInputValue - Current Date for HTML Input", () => {
    it("returns today's date in YYYY-MM-DD format", () => {
      const result = getTodayDateInputValue();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      // Verify it's actually today
      const today = new Date();
      const expected = `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      expect(result).toBe(expected);
    });

    it("pads single-digit months and days", () => {
      const result = getTodayDateInputValue();
      const parts = result.split("-");
      expect(parts).toHaveLength(3);
      expect(parts[0]).toHaveLength(4); // Year
      expect(parts[1]).toHaveLength(2); // Month
      expect(parts[2]).toHaveLength(2); // Day
    });
  });

  describe("Integration Tests - Real-world Scenarios", () => {
    it("handles user-entered dates from form inputs", () => {
      const userInput = "2024-03-15";
      expect(isValidDate(userInput)).toBe(true);
      const isoString = safeToISOString(userInput);
      expect(isoString).toBeTruthy();
      const dateObj = safeToDate(userInput);
      expect(dateObj).toBeInstanceOf(Date);
    });

    it("handles Firestore data round-trip", () => {
      const firestoreTimestamp = {
        seconds: 1705318200,
        nanoseconds: 123456789,
      };

      const isoString = safeToISOString(firestoreTimestamp);
      expect(isoString).toBeTruthy();

      const dateObj = safeToDate(firestoreTimestamp);
      expect(dateObj).toBeInstanceOf(Date);

      expect(isValidDate(firestoreTimestamp)).toBe(true);
    });

    it("handles date comparison scenarios", () => {
      const date1 = safeToDate("2024-01-15");
      const date2 = safeToDate("2024-01-20");

      expect(date1).toBeTruthy();
      expect(date2).toBeTruthy();
      expect(date1!.getTime()).toBeLessThan(date2!.getTime());
    });

    it("handles invalid data gracefully in production", () => {
      const invalidInputs = [
        null,
        undefined,
        "",
        "invalid",
        NaN,
        {},
        [],
        "0000-00-00",
      ];

      invalidInputs.forEach((input) => {
        expect(isValidDate(input)).toBe(false);
        expect(safeToDate(input)).toBeNull();
        expect(safeToISOString(input)).toBeNull();

        // But with fallback, always get valid date
        const fallback = new Date("2024-01-01T00:00:00Z");
        const result = toISOStringOrDefault(input, fallback);
        expect(result).toBe("2024-01-01T00:00:00.000Z");
      });
    });

    it("handles timezone conversion scenarios", () => {
      const utcDate = new Date("2024-01-15T00:00:00Z");
      const isoString = safeToISOString(utcDate);
      expect(isoString).toBe("2024-01-15T00:00:00.000Z");

      const dateInput = toDateInputValue(utcDate);
      expect(dateInput).toBe("2024-01-15");
    });

    it("handles date age calculation", () => {
      const birthDate = safeToDate("1990-01-15");
      const today = new Date();

      expect(birthDate).toBeTruthy();
      const ageYears = Math.floor(
        (today.getTime() - birthDate!.getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      );
      expect(ageYears).toBeGreaterThan(30);
      expect(ageYears).toBeLessThan(150);
    });

    it("handles date range validation", () => {
      const startDate = safeToDate("2024-01-01");
      const endDate = safeToDate("2024-12-31");
      const testDate = safeToDate("2024-06-15");

      expect(startDate).toBeTruthy();
      expect(endDate).toBeTruthy();
      expect(testDate).toBeTruthy();

      expect(testDate!.getTime()).toBeGreaterThan(startDate!.getTime());
      expect(testDate!.getTime()).toBeLessThan(endDate!.getTime());
    });
  });
});

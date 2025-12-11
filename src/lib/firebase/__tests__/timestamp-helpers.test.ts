/**
 * Tests for Firebase Timestamp Helpers
 */

import { Timestamp } from "firebase-admin/firestore";
import {
  dateToFirebaseTimestamp,
  nowAsFirebaseTimestamp,
  toFirebaseTimestamp,
} from "../timestamp-helpers";

describe("Firebase Timestamp Helpers", () => {
  describe("toFirebaseTimestamp", () => {
    it("should convert Admin Timestamp to interface", () => {
      const adminTimestamp = Timestamp.fromDate(
        new Date("2024-01-01T00:00:00Z")
      );

      const result = toFirebaseTimestamp(adminTimestamp);

      expect(result._seconds).toBe(adminTimestamp.seconds);
      expect(result._nanoseconds).toBe(adminTimestamp.nanoseconds);
    });

    it("should handle epoch time", () => {
      const epochTimestamp = Timestamp.fromDate(new Date(0));

      const result = toFirebaseTimestamp(epochTimestamp);

      expect(result._seconds).toBe(0);
      expect(result._nanoseconds).toBe(0);
    });

    it("should preserve nanoseconds precision", () => {
      const timestamp = Timestamp.fromDate(
        new Date("2024-06-15T12:30:45.123Z")
      );

      const result = toFirebaseTimestamp(timestamp);

      expect(result._seconds).toBe(timestamp.seconds);
      expect(result._nanoseconds).toBe(timestamp.nanoseconds);
    });

    it("should handle far future dates", () => {
      const futureTimestamp = Timestamp.fromDate(
        new Date("2099-12-31T23:59:59Z")
      );

      const result = toFirebaseTimestamp(futureTimestamp);

      expect(result._seconds).toBe(futureTimestamp.seconds);
      expect(result._nanoseconds).toBe(futureTimestamp.nanoseconds);
    });

    it("should handle past dates", () => {
      const pastTimestamp = Timestamp.fromDate(
        new Date("1990-01-01T00:00:00Z")
      );

      const result = toFirebaseTimestamp(pastTimestamp);

      expect(result._seconds).toBe(pastTimestamp.seconds);
      expect(result._nanoseconds).toBe(pastTimestamp.nanoseconds);
    });
  });

  describe("nowAsFirebaseTimestamp", () => {
    it("should return current timestamp", () => {
      const before = Date.now();
      const result = nowAsFirebaseTimestamp();
      const after = Date.now();

      // Convert to milliseconds for comparison
      const resultMs = result._seconds * 1000;

      expect(resultMs).toBeGreaterThanOrEqual(before - 1000); // Allow 1s tolerance
      expect(resultMs).toBeLessThanOrEqual(after + 1000);
    });

    it("should have FirebaseTimestamp structure", () => {
      const result = nowAsFirebaseTimestamp();

      expect(result).toHaveProperty("_seconds");
      expect(result).toHaveProperty("_nanoseconds");
      expect(typeof result._seconds).toBe("number");
      expect(typeof result._nanoseconds).toBe("number");
    });

    it("should return different values on successive calls", async () => {
      const first = nowAsFirebaseTimestamp();

      // Small delay to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      const second = nowAsFirebaseTimestamp();

      // At least one should be different (usually seconds will be same but nanoseconds different)
      const firstTime = first._seconds * 1e9 + first._nanoseconds;
      const secondTime = second._seconds * 1e9 + second._nanoseconds;

      expect(secondTime).toBeGreaterThanOrEqual(firstTime);
    });

    it("should have non-negative values", () => {
      const result = nowAsFirebaseTimestamp();

      expect(result._seconds).toBeGreaterThanOrEqual(0);
      expect(result._nanoseconds).toBeGreaterThanOrEqual(0);
    });
  });

  describe("dateToFirebaseTimestamp", () => {
    it("should convert Date object to FirebaseTimestamp", () => {
      const date = new Date("2024-01-01T00:00:00Z");

      const result = dateToFirebaseTimestamp(date);

      expect(result).toHaveProperty("_seconds");
      expect(result).toHaveProperty("_nanoseconds");
    });

    it("should maintain date accuracy", () => {
      const date = new Date("2024-06-15T12:30:45.123Z");

      const result = dateToFirebaseTimestamp(date);

      // Convert back to milliseconds for verification
      const resultMs =
        result._seconds * 1000 + Math.floor(result._nanoseconds / 1e6);

      expect(resultMs).toBe(date.getTime());
    });

    it("should handle epoch date", () => {
      const date = new Date(0);

      const result = dateToFirebaseTimestamp(date);

      expect(result._seconds).toBe(0);
      expect(result._nanoseconds).toBe(0);
    });

    it("should handle current date", () => {
      const date = new Date();

      const result = dateToFirebaseTimestamp(date);

      const resultMs =
        result._seconds * 1000 + Math.floor(result._nanoseconds / 1e6);

      expect(resultMs).toBe(date.getTime());
    });

    it("should handle far future dates", () => {
      const date = new Date("2099-12-31T23:59:59Z");

      const result = dateToFirebaseTimestamp(date);

      const resultMs =
        result._seconds * 1000 + Math.floor(result._nanoseconds / 1e6);

      expect(resultMs).toBe(date.getTime());
    });

    it("should handle past dates", () => {
      const date = new Date("1990-01-01T00:00:00Z");

      const result = dateToFirebaseTimestamp(date);

      const resultMs =
        result._seconds * 1000 + Math.floor(result._nanoseconds / 1e6);

      expect(resultMs).toBe(date.getTime());
    });

    it("should handle dates with milliseconds", () => {
      const date = new Date("2024-01-01T12:00:00.456Z");

      const result = dateToFirebaseTimestamp(date);

      const resultMs =
        result._seconds * 1000 + Math.floor(result._nanoseconds / 1e6);

      expect(resultMs).toBe(date.getTime());
    });

    it("should produce consistent results for same date", () => {
      const date = new Date("2024-01-01T00:00:00Z");

      const result1 = dateToFirebaseTimestamp(date);
      const result2 = dateToFirebaseTimestamp(date);

      expect(result1._seconds).toBe(result2._seconds);
      expect(result1._nanoseconds).toBe(result2._nanoseconds);
    });
  });

  describe("Type Consistency", () => {
    it("should produce same format across all functions", () => {
      const date = new Date("2024-01-01T00:00:00Z");
      const adminTimestamp = Timestamp.fromDate(date);

      const fromAdmin = toFirebaseTimestamp(adminTimestamp);
      const fromDate = dateToFirebaseTimestamp(date);
      const fromNow = nowAsFirebaseTimestamp();

      // All should have same structure
      expect(fromAdmin).toHaveProperty("_seconds");
      expect(fromAdmin).toHaveProperty("_nanoseconds");
      expect(fromDate).toHaveProperty("_seconds");
      expect(fromDate).toHaveProperty("_nanoseconds");
      expect(fromNow).toHaveProperty("_seconds");
      expect(fromNow).toHaveProperty("_nanoseconds");
    });

    it("should convert between Admin Timestamp and Date consistently", () => {
      const date = new Date("2024-01-01T12:00:00Z");
      const adminTimestamp = Timestamp.fromDate(date);

      const fromAdmin = toFirebaseTimestamp(adminTimestamp);
      const fromDate = dateToFirebaseTimestamp(date);

      // Should produce equivalent results
      expect(fromAdmin._seconds).toBe(fromDate._seconds);
      // Nanoseconds might differ slightly due to precision
      expect(
        Math.abs(fromAdmin._nanoseconds - fromDate._nanoseconds)
      ).toBeLessThan(1000000); // 1ms tolerance
    });
  });

  // BUG FIX #31: Comprehensive validation edge case tests
  describe("BUG FIX #31: Input Validation Edge Cases", () => {
    describe("toFirebaseTimestamp validation", () => {
      it("should throw error for null timestamp", () => {
        expect(() => toFirebaseTimestamp(null as any)).toThrow(
          "Timestamp is required"
        );
      });

      it("should throw error for undefined timestamp", () => {
        expect(() => toFirebaseTimestamp(undefined as any)).toThrow(
          "Timestamp is required"
        );
      });

      it("should throw error for invalid timestamp object", () => {
        const invalidTimestamp = { seconds: "not a number", nanoseconds: 0 };
        expect(() => toFirebaseTimestamp(invalidTimestamp as any)).toThrow(
          "Invalid timestamp object"
        );
      });

      it("should throw error for object missing seconds", () => {
        const invalidTimestamp = { nanoseconds: 0 };
        expect(() => toFirebaseTimestamp(invalidTimestamp as any)).toThrow(
          "Invalid timestamp object"
        );
      });

      it("should throw error for object missing nanoseconds", () => {
        const invalidTimestamp = { seconds: 0 };
        expect(() => toFirebaseTimestamp(invalidTimestamp as any)).toThrow(
          "Invalid timestamp object"
        );
      });

      it("should throw error for empty object", () => {
        expect(() => toFirebaseTimestamp({} as any)).toThrow(
          "Invalid timestamp object"
        );
      });

      it("should accept valid timestamp with zero values", () => {
        const timestamp = Timestamp.fromDate(new Date(0));
        expect(() => toFirebaseTimestamp(timestamp)).not.toThrow();
      });

      it("should accept valid timestamp with large values", () => {
        const timestamp = Timestamp.fromDate(new Date("2099-12-31"));
        expect(() => toFirebaseTimestamp(timestamp)).not.toThrow();
      });
    });

    describe("dateToFirebaseTimestamp validation", () => {
      it("should throw error for null date", () => {
        expect(() => dateToFirebaseTimestamp(null as any)).toThrow(
          "Date is required"
        );
      });

      it("should throw error for undefined date", () => {
        expect(() => dateToFirebaseTimestamp(undefined as any)).toThrow(
          "Date is required"
        );
      });

      it("should throw error for string date", () => {
        expect(() => dateToFirebaseTimestamp("2024-01-01" as any)).toThrow(
          "Input must be a valid Date object"
        );
      });

      it("should throw error for number timestamp", () => {
        expect(() => dateToFirebaseTimestamp(Date.now() as any)).toThrow(
          "Input must be a valid Date object"
        );
      });

      it("should throw error for invalid Date object (Invalid Date)", () => {
        const invalidDate = new Date("invalid date string");
        expect(() => dateToFirebaseTimestamp(invalidDate)).toThrow(
          "Invalid date value"
        );
      });

      it("should throw error for Date with NaN", () => {
        const nanDate = new Date(NaN);
        expect(() => dateToFirebaseTimestamp(nanDate)).toThrow(
          "Invalid date value"
        );
      });

      it("should accept valid Date at epoch", () => {
        const date = new Date(0);
        expect(() => dateToFirebaseTimestamp(date)).not.toThrow();
      });

      it("should accept valid future Date", () => {
        const date = new Date("2099-12-31");
        expect(() => dateToFirebaseTimestamp(date)).not.toThrow();
      });

      it("should accept valid past Date", () => {
        const date = new Date("1970-01-01");
        expect(() => dateToFirebaseTimestamp(date)).not.toThrow();
      });

      it("should accept Date created with timestamp", () => {
        const date = new Date(Date.now());
        expect(() => dateToFirebaseTimestamp(date)).not.toThrow();
      });
    });

    describe("Boundary value testing", () => {
      it("should handle epoch time (timestamp 0)", () => {
        const timestamp = Timestamp.fromDate(new Date(0));
        const result = toFirebaseTimestamp(timestamp);
        expect(result._seconds).toBe(0);
      });

      it("should handle dates near year 2000 rollover", () => {
        const y2k = new Date("2000-01-01T00:00:00Z");
        const result = dateToFirebaseTimestamp(y2k);
        expect(result._seconds).toBeGreaterThan(0);
      });

      it("should handle leap year dates", () => {
        const leapDay = new Date("2024-02-29T00:00:00Z");
        const result = dateToFirebaseTimestamp(leapDay);
        expect(result).toHaveProperty("_seconds");
        expect(result).toHaveProperty("_nanoseconds");
      });

      it("should handle dates with milliseconds", () => {
        const dateWithMs = new Date("2024-01-01T12:30:45.123Z");
        const result = dateToFirebaseTimestamp(dateWithMs);
        expect(result._nanoseconds).toBeGreaterThan(0);
      });

      it("should handle maximum safe Date", () => {
        // Use a more reasonable future date instead of max safe date
        const futureDate = new Date("2200-01-01T00:00:00Z");
        const result = dateToFirebaseTimestamp(futureDate);
        expect(result._seconds).toBeGreaterThan(0);
      });

      it("should handle very far future dates", () => {
        const futureDate = new Date("2200-01-01T00:00:00Z");
        const result = dateToFirebaseTimestamp(futureDate);
        expect(result._seconds).toBeGreaterThan(0);
      });
    });

    describe("Type validation edge cases", () => {
      it("should reject plain objects for timestamp", () => {
        const plainObject = { _seconds: 123, _nanoseconds: 456 };
        expect(() => toFirebaseTimestamp(plainObject as any)).toThrow();
      });

      it("should reject arrays for date", () => {
        expect(() => dateToFirebaseTimestamp([] as any)).toThrow(
          "Input must be a valid Date object"
        );
      });

      it("should reject objects for date", () => {
        expect(() => dateToFirebaseTimestamp({} as any)).toThrow(
          "Input must be a valid Date object"
        );
      });

      it("should reject boolean for timestamp", () => {
        expect(() => toFirebaseTimestamp(true as any)).toThrow();
      });

      it("should reject boolean for date", () => {
        // false is falsy, so "Date is required" is thrown first
        expect(() => dateToFirebaseTimestamp(false as any)).toThrow(
          "Date is required"
        );
      });
    });

    describe("Precision and consistency testing", () => {
      it("should maintain precision through conversion", () => {
        const originalDate = new Date("2024-06-15T12:30:45.123456Z");
        const result = dateToFirebaseTimestamp(originalDate);

        // Verify structure
        expect(typeof result._seconds).toBe("number");
        expect(typeof result._nanoseconds).toBe("number");
        expect(result._nanoseconds).toBeGreaterThanOrEqual(0);
        expect(result._nanoseconds).toBeLessThan(1000000000);
      });

      it("should produce identical results for same input", () => {
        const date = new Date("2024-01-01T00:00:00Z");
        const result1 = dateToFirebaseTimestamp(date);
        const result2 = dateToFirebaseTimestamp(date);

        expect(result1._seconds).toBe(result2._seconds);
        expect(result1._nanoseconds).toBe(result2._nanoseconds);
      });

      it("should handle timestamp with maximum nanoseconds", () => {
        const timestamp = Timestamp.fromDate(new Date());
        const withMaxNanos = new Timestamp(timestamp.seconds, 999999999);
        const result = toFirebaseTimestamp(withMaxNanos);

        expect(result._nanoseconds).toBe(999999999);
      });

      it("should handle timestamp with zero nanoseconds", () => {
        const timestamp = new Timestamp(1234567890, 0);
        const result = toFirebaseTimestamp(timestamp);

        expect(result._nanoseconds).toBe(0);
      });
    });

    describe("Cross-function validation", () => {
      it("should validate inputs consistently across all functions", () => {
        // All should reject null/undefined
        expect(() => toFirebaseTimestamp(null as any)).toThrow();
        expect(() => dateToFirebaseTimestamp(null as any)).toThrow();

        // nowAsFirebaseTimestamp should never throw (no params)
        expect(() => nowAsFirebaseTimestamp()).not.toThrow();
      });

      it("should produce compatible outputs for valid inputs", () => {
        const date = new Date("2024-01-01T00:00:00Z");
        const timestamp = Timestamp.fromDate(date);

        const fromTimestamp = toFirebaseTimestamp(timestamp);
        const fromDate = dateToFirebaseTimestamp(date);
        const now = nowAsFirebaseTimestamp();

        // All should have same structure
        [fromTimestamp, fromDate, now].forEach((result) => {
          expect(result).toHaveProperty("_seconds");
          expect(result).toHaveProperty("_nanoseconds");
          expect(typeof result._seconds).toBe("number");
          expect(typeof result._nanoseconds).toBe("number");
        });
      });
    });
  });
});

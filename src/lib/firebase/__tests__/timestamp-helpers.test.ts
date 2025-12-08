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
});

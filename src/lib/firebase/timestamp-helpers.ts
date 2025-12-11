/**
 * Firebase Timestamp Type Helpers
 * Provides type-safe conversion between Firebase Admin Timestamp and FirebaseTimestamp interface
 */

import { FirebaseTimestamp } from "@/types/shared/common.types";
import { Timestamp } from "firebase-admin/firestore";

/**
 * Convert Firebase Admin Timestamp to FirebaseTimestamp interface
 * This is necessary because Firebase Admin SDK returns Timestamp objects
 * but our type definitions use FirebaseTimestamp interface
 */
export function toFirebaseTimestamp(timestamp: Timestamp): FirebaseTimestamp {
  // BUG FIX #31: Validate timestamp input
  if (!timestamp) {
    throw new Error("Timestamp is required");
  }
  if (
    typeof timestamp.seconds !== "number" ||
    typeof timestamp.nanoseconds !== "number"
  ) {
    throw new Error("Invalid timestamp object");
  }

  return {
    _seconds: timestamp.seconds,
    _nanoseconds: timestamp.nanoseconds,
  };
}

/**
 * Get current timestamp as FirebaseTimestamp interface
 */
export function nowAsFirebaseTimestamp(): FirebaseTimestamp {
  return toFirebaseTimestamp(Timestamp.now());
}

/**
 * Convert date to FirebaseTimestamp interface
 */
export function dateToFirebaseTimestamp(date: Date): FirebaseTimestamp {
  // BUG FIX #31: Validate date input
  if (!date) {
    throw new Error("Date is required");
  }
  if (!(date instanceof Date)) {
    throw new Error("Input must be a valid Date object");
  }
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date value");
  }

  return toFirebaseTimestamp(Timestamp.fromDate(date));
}

/**
 * Firebase Timestamp Type Helpers
 * Provides type-safe conversion between Firebase Admin Timestamp and FirebaseTimestamp interface
 */

import { Timestamp } from "firebase-admin/firestore";
import { FirebaseTimestamp } from "@/types/shared/common.types";

/**
 * Convert Firebase Admin Timestamp to FirebaseTimestamp interface
 * This is necessary because Firebase Admin SDK returns Timestamp objects
 * but our type definitions use FirebaseTimestamp interface
 */
export function toFirebaseTimestamp(timestamp: Timestamp): FirebaseTimestamp {
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
  return toFirebaseTimestamp(Timestamp.fromDate(date));
}

/**
 * @fileoverview TypeScript Module
 * @module src/lib/firebase/timestamp-helpers
 * @description This file contains functionality related to timestamp-helpers
 * 
 * @created 2025-12-05
 * @author Development Team
 */

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
/**
 * Performs to firebase timestamp operation
 *
 * @param {Timestamp} timestamp - The timestamp
 *
 * @returns {any} The tofirebasetimestamp result
 *
 * @example
 * toFirebaseTimestamp(timestamp);
 */

/**
 * Performs to firebase timestamp operation
 *
 * @param {Timestamp} timestamp - The timestamp
 *
 * @returns {any} The tofirebasetimestamp result
 *
 * @example
 * toFirebaseTimestamp(timestamp);
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
/**
 * Performs now as firebase timestamp operation
 *
 * @returns {any} The nowasfirebasetimestamp result
 *
 * @example
 * nowAsFirebaseTimestamp();
 */

/**
 * Performs now as firebase timestamp operation
 *
 * @returns {any} The nowasfirebasetimestamp result
 *
 * @example
 * nowAsFirebaseTimestamp();
 */

export function nowAsFirebaseTimestamp(): FirebaseTimestamp {
  return toFirebaseTimestamp(Timestamp.now());
}

/**
 * Convert date to FirebaseTimestamp interface
 */
/**
 * Performs date to firebase timestamp operation
 *
 * @param {Date} date - The date
 *
 * @returns {any} The datetofirebasetimestamp result
 *
 * @example
 * dateToFirebaseTimestamp(date);
 */

/**
 * Performs date to firebase timestamp operation
 *
 * @param {Date} date - The date
 *
 * @returns {any} The datetofirebasetimestamp result
 *
 * @example
 * dateToFirebaseTimestamp(date);
 */

export function dateToFirebaseTimestamp(date: Date): FirebaseTimestamp {
  return toFirebaseTimestamp(Timestamp.fromDate(date));
}

/**
 * @fileoverview Utility Functions
 * @module src/lib/date-utils
 * @description This file contains utility functions for date
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Date utility functions for safe ISO string conversion
 */
import { logError } from "@/lib/firebase-error-logger";

/**
 * Safely converts a date to ISO string, handling invalid dates
 * @param date - Date to convert (Date object, string, number, or Firestore timestamp)
 * @returns ISO string or null if date is invalid
 */
/**
 * Performs safe to i s o string operation
 *
 * @param {any} date - The date
 *
 * @returns {string} The safetoisostring result
 *
 * @example
 * safeToISOString(date);
 */

/**
 * Performs safe to i s o string operation
 *
 * @param {any} date - The date
 *
 * @returns {string} The safetoisostring result
 *
 * @example
 * safeToISOString(date);
 */

export function safeToISOString(date: any): string | null {
  if (!date) return null;

  try {
    // Handle Firestore Timestamp
    if (date?.seconds !== undefined) {
      const d = new Date(date.seconds * 1000);
      if (isNaN(d.getTime())) return null;
      return d.toISOString();
    }

    // Handle Date object, string, or number
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    return d.toISOString();
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "dateUtils.toISOStringOrNull",
      /** Metadata */
      metadata: { date },
    });
    return null;
  }
}

/**
 * Safely converts a date to ISO string with fallback
 * @param date - Date to convert
 * @param fallback - Fallback value if date is invalid (defaults to current date)
 * @returns ISO string
 */
/**
 * Performs to i s o string or default operation
 *
 * @param {any} date - The date
 * @param {Date} [fallback] - The fallback
 *
 * @returns {string} The toisostringordefault result
 *
 * @example
 * toISOStringOrDefault(date, fallback);
 */

/**
 * Performs to i s o string or default operation
 *
 * @returns {any} The toisostringordefault result
 *
 * @example
 * toISOStringOrDefault();
 */

export function toISOStringOrDefault(
  /** Date */
  date: any,
  /** Fallback */
  fallback: Date = new Date(),
): string {
  return safeToISOString(date) ?? fallback.toISOString();
}

/**
 * Validates if a date is valid
 * @param date - Date to validate
 * @returns true if date is valid
 */
/**
 * Checks if valid date
 *
 * @param {any} date - The date
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isValidDate(date);
 */

/**
 * Checks if valid date
 *
 * @param {any} date - The date
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isValidDate(date);
 */

export function isValidDate(date: any): boolean {
  if (!date) return false;

  try {
    // Handle Firestore Timestamp
    if (date?.seconds !== undefined) {
      const d = new Date(date.seconds * 1000);
      return !isNaN(d.getTime());
    }

    const d = new Date(date);
    return !isNaN(d.getTime());
  } catch {
    return false;
  }
}

/**
 * Safely converts a date to Date object
 * @param date - Date to convert
 * @returns Date object or null if invalid
 */
/**
 * Performs safe to date operation
 *
 * @param {any} date - The date
 *
 * @returns {any} The safetodate result
 *
 * @example
 * safeToDate(date);
 */

/**
 * Performs safe to date operation
 *
 * @param {any} date - The date
 *
 * @returns {any} The safetodate result
 *
 * @example
 * safeToDate(date);
 */

export function safeToDate(date: any): Date | null {
  if (!date) return null;

  try {
    // Handle Firestore Timestamp
    if (date?.seconds !== undefined) {
      const d = new Date(date.seconds * 1000);
      if (isNaN(d.getTime())) return null;
      return d;
    }

    // Handle Date object, string, or number
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    return d;
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "dateUtils.toDate",
      /** Metadata */
      metadata: { date },
    });
    return null;
  }
}

/**
 * Formats date for HTML input[type="date"] (YYYY-MM-DD)
 * @param date - Date to format
 * @returns Date string in YYYY-MM-DD format or empty string if invalid
 */
/**
 * Performs to date input value operation
 *
 * @param {any} date - The date
 *
 * @returns {string} The todateinputvalue result
 *
 * @example
 * toDateInputValue(date);
 */

/**
 * Performs to date input value operation
 *
 * @param {any} date - The date
 *
 * @returns {string} The todateinputvalue result
 *
 * @example
 * toDateInputValue(date);
 */

export function toDateInputValue(date: any): string {
  const isoString = safeToISOString(date);
  return isoString ? isoString.split("T")[0] : "";
}

/**
 * Gets current date in YYYY-MM-DD format for date inputs
 * @returns Today's date in YYYY-MM-DD format
 */
/**
 * Retrieves today date input value
 *
 * @returns {string} The todaydateinputvalue result
 *
 * @example
 * getTodayDateInputValue();
 */

/**
 * Retrieves today date input value
 *
 * @returns {string} The todaydateinputvalue result
 *
 * @example
 * getTodayDateInputValue();
 */

export function getTodayDateInputValue(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Date utility functions for safe ISO string conversion
 */

/**
 * Safely converts a date to ISO string, handling invalid dates
 * @param date - Date to convert (Date object, string, number, or Firestore timestamp)
 * @returns ISO string or null if date is invalid
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
    console.error("Error converting date to ISO string:", error, { date });
    return null;
  }
}

/**
 * Safely converts a date to ISO string with fallback
 * @param date - Date to convert
 * @param fallback - Fallback value if date is invalid (defaults to current date)
 * @returns ISO string
 */
export function toISOStringOrDefault(
  date: any,
  fallback: Date = new Date()
): string {
  return safeToISOString(date) ?? fallback.toISOString();
}

/**
 * Validates if a date is valid
 * @param date - Date to validate
 * @returns true if date is valid
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
    console.error("Error converting to date:", error, { date });
    return null;
  }
}

/**
 * Formats date for HTML input[type="date"] (YYYY-MM-DD)
 * @param date - Date to format
 * @returns Date string in YYYY-MM-DD format or empty string if invalid
 */
export function toDateInputValue(date: any): string {
  const isoString = safeToISOString(date);
  return isoString ? isoString.split("T")[0] : "";
}

/**
 * Gets current date in YYYY-MM-DD format for date inputs
 * @returns Today's date in YYYY-MM-DD format
 */
export function getTodayDateInputValue(): string {
  return new Date().toISOString().split("T")[0];
}

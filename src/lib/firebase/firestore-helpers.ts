/**
 * Firestore Helper Utilities
 *
 * Helper functions for working with Firestore documents.
 */

/**
 * Remove undefined values from an object (deep clean)
 * Firestore doesn't accept undefined values - they must be omitted or null
 *
 * @param obj - Object to clean
 * @returns New object without undefined values
 */
export function removeUndefined<T extends Record<string, any>>(
  obj: T,
): Partial<T> {
  const result: any = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];

      // Skip undefined values
      if (value === undefined) {
        continue;
      }

      // Recursively clean nested objects
      if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        !(value && value.constructor && value.constructor.name === "Date")
      ) {
        const cleaned = removeUndefined(value);
        // Only add if the cleaned object has properties
        if (Object.keys(cleaned).length > 0) {
          result[key] = cleaned;
        }
      }
      // Keep arrays and primitives as-is (excluding undefined)
      else {
        result[key] = value;
      }
    }
  }

  return result;
}

/**
 * Prepare data for Firestore by removing undefined values
 * Use this before any Firestore write operation
 */
export function prepareForFirestore<T extends Record<string, any>>(
  data: T,
): Partial<T> {
  return removeUndefined(data);
}

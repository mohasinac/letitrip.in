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

/**
 * Recursively convert Firestore Timestamp instances to plain JS Date objects.
 * Firestore Admin SDK returns Timestamp class instances for date fields.
 * React RSC cannot serialize class instances to Client Components — JS Date
 * objects are supported and serialized as ISO strings.
 *
 * @param obj - Raw Firestore document data
 * @returns Data with all Timestamps replaced by Date objects
 */
export function deserializeTimestamps<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  // Firestore Timestamp — has toDate() but is not a plain Date
  if (
    typeof obj === "object" &&
    !(obj instanceof Date) &&
    typeof (obj as any).toDate === "function"
  ) {
    return (obj as any).toDate() as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map(deserializeTimestamps) as unknown as T;
  }
  if (
    typeof obj === "object" &&
    !Array.isArray(obj) &&
    !(obj instanceof Date)
  ) {
    return Object.fromEntries(
      Object.entries(obj as object).map(([k, v]) => [
        k,
        deserializeTimestamps(v),
      ]),
    ) as unknown as T;
  }
  return obj;
}

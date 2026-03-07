/**
 * Data Type Converters
 *
 * Utilities for converting between different data types
 */

/**
 * Converts a string to a boolean value
 *
 * @param value - The string to convert ('true', 'yes', '1', 'on' are considered true)
 * @returns The boolean representation
 *
 * @example
 * ```typescript
 * console.log(stringToBoolean('true')); // true
 * console.log(stringToBoolean('yes')); // true
 * console.log(stringToBoolean('false')); // false
 * ```
 */
export function stringToBoolean(value: string): boolean {
  const truthyValues = ["true", "yes", "1", "on"];
  return truthyValues.includes(value.toLowerCase());
}

/**
 * Converts a boolean to a string representation
 *
 * @param value - The boolean value to convert
 * @param format - The output format: 'yesno', 'truefalse', or 'onoff' (default: 'truefalse')
 * @returns The string representation of the boolean
 *
 * @example
 * ```typescript
 * console.log(booleanToString(true, 'yesno')); // 'Yes'
 * console.log(booleanToString(false, 'onoff')); // 'Off'
 * ```
 */
export function booleanToString(
  value: boolean,
  format: "yesno" | "truefalse" | "onoff" = "truefalse",
): string {
  const formats = {
    yesno: { true: "Yes", false: "No" },
    truefalse: { true: "True", false: "False" },
    onoff: { true: "On", false: "Off" },
  };

  return formats[format][value.toString() as "true" | "false"];
}

/**
 * Converts an array to an object using a specified field as the key
 *
 * @param arr - The array of objects to convert
 * @param keyField - The field name to use as object keys
 * @returns An object with keys from the specified field
 *
 * @example
 * ```typescript
 * const users = [{ id: '1', name: 'Alice' }, { id: '2', name: 'Bob' }];
 * const result = arrayToObject(users, 'id');
 * console.log(result); // { '1': { id: '1', name: 'Alice' }, '2': { id: '2', name: 'Bob' } }
 * ```
 */
export function arrayToObject<T>(
  arr: T[],
  keyField: keyof T,
): Record<string, T> {
  return arr.reduce(
    (acc, item) => {
      const key = String(item[keyField]);
      acc[key] = item;
      return acc;
    },
    {} as Record<string, T>,
  );
}

/**
 * Converts an object to an array of its values
 *
 * @param obj - The object to convert
 * @returns An array of all values in the object
 *
 * @example
 * ```typescript
 * const obj = { a: 1, b: 2, c: 3 };
 * const result = objectToArray(obj);
 * console.log(result); // [1, 2, 3]
 * ```
 */
export function objectToArray<T>(obj: Record<string, T>): T[] {
  return Object.values(obj);
}

/**
 * Converts a URL query string to an object
 *
 * @param queryString - The query string to parse (with or without leading '?')
 * @returns An object with query parameter keys and values
 *
 * @example
 * ```typescript
 * const result = queryStringToObject('?name=John&age=30');
 * console.log(result); // { name: 'John', age: '30' }
 * ```
 */
export function queryStringToObject(
  queryString: string,
): Record<string, string> {
  const params = new URLSearchParams(queryString);
  const result: Record<string, string> = {};

  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}

/**
 * Converts an object to a URL query string
 *
 * @param obj - The object to convert
 * @returns A URL-encoded query string (without leading '?')
 *
 * @example
 * ```typescript
 * const result = objectToQueryString({ name: 'John', age: 30 });
 * console.log(result); // 'name=John&age=30'
 * ```
 */
export function objectToQueryString(obj: Record<string, any>): string {
  const params = new URLSearchParams();

  Object.entries(obj).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      params.append(key, String(value));
    }
  });

  return params.toString();
}

/**
 * Converts a Firestore timestamp to a JavaScript Date object
 *
 * @param timestamp - The Firestore timestamp (with toDate method or seconds property)
 * @returns A JavaScript Date object
 *
 * @example
 * ```typescript
 * const firestoreTimestamp = { seconds: 1609459200, nanoseconds: 0 };
 * const result = firestoreTimestampToDate(firestoreTimestamp);
 * console.log(result); // Date object for 2021-01-01
 * ```
 */
export function firestoreTimestampToDate(timestamp: any): Date {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  if (timestamp?.seconds) {
    return new Date(timestamp.seconds * 1000);
  }
  return new Date(timestamp);
}

/**
 * Converts a Date object or date string to ISO 8601 format
 *
 * @param date - The date to convert (Date object or string)
 * @returns An ISO 8601 formatted date string
 *
 * @example
 * ```typescript
 * const result = dateToISOString(new Date('2024-01-15'));
 * console.log(result); // '2024-01-15T00:00:00.000Z'
 * ```
 */
export function dateToISOString(date: Date | string): string {
  return typeof date === "string"
    ? new Date(date).toISOString()
    : date.toISOString();
}

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
 * Converts a CSV string to an array of objects
 *
 * @param csv - The CSV string with headers in the first row
 * @param delimiter - The field delimiter (default: ',')
 * @returns An array of objects with keys from CSV headers
 *
 * @example
 * ```typescript
 * const csv = 'name,age\nAlice,25\nBob,30';
 * const result = csvToArray(csv);
 * console.log(result); // [{ name: 'Alice', age: '25' }, { name: 'Bob', age: '30' }]
 * ```
 */
export function csvToArray(
  csv: string,
  delimiter: string = ",",
): Record<string, string>[] {
  const lines = csv.trim().split("\n");
  const headers = lines[0].split(delimiter).map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(delimiter).map((v) => v.trim());
    const obj: Record<string, string> = {};

    headers.forEach((header, index) => {
      obj[header] = values[index] || "";
    });

    return obj;
  });
}

/**
 * Converts an array of objects to a CSV string
 *
 * @param data - The array of objects to convert
 * @param delimiter - The field delimiter (default: ',')
 * @returns A CSV string with headers in the first row
 *
 * @example
 * ```typescript
 * const data = [{ name: 'Alice', age: 25 }, { name: 'Bob', age: 30 }];
 * const result = arrayToCsv(data);
 * console.log(result); // 'name,age\nAlice,25\nBob,30'
 * ```
 */
export function arrayToCsv(
  data: Record<string, any>[],
  delimiter: string = ",",
): string {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const headerRow = headers.join(delimiter);

  const rows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header];
        return typeof value === "string" && value.includes(delimiter)
          ? `"${value}"`
          : value;
      })
      .join(delimiter),
  );

  return [headerRow, ...rows].join("\n");
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

/**
 * Creates a deep clone of an object using JSON serialization
 *
 * @param obj - The object to clone
 * @returns A deep copy of the object
 *
 * @example
 * ```typescript
 * const original = { a: 1, b: { c: 2 } };
 * const copy = deepClone(original);
 * copy.b.c = 3;
 * console.log(original.b.c); // 2 (unchanged)
 * ```
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Flattens a nested object into a single-level object with dot notation keys
 *
 * @param obj - The nested object to flatten
 * @param prefix - Internal prefix for recursion (default: '')
 * @returns A flattened object with dot-notation keys
 *
 * @example
 * ```typescript
 * const nested = { user: { name: 'John', address: { city: 'NYC' } } };
 * const result = flattenObject(nested);
 * console.log(result); // { 'user.name': 'John', 'user.address.city': 'NYC' }
 * ```
 */
export function flattenObject(
  obj: Record<string, any>,
  prefix: string = "",
): Record<string, any> {
  const flattened: Record<string, any> = {};

  Object.entries(obj).forEach(([key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(flattened, flattenObject(value, newKey));
    } else {
      flattened[newKey] = value;
    }
  });

  return flattened;
}

/**
 * Converts a flattened object back to a nested structure
 *
 * @param obj - The flattened object with dot-notation keys
 * @returns A nested object structure
 *
 * @example
 * ```typescript
 * const flat = { 'user.name': 'John', 'user.address.city': 'NYC' };
 * const result = unflattenObject(flat);
 * console.log(result); // { user: { name: 'John', address: { city: 'NYC' } } }
 * ```
 */
export function unflattenObject(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  Object.entries(obj).forEach(([key, value]) => {
    const keys = key.split(".");
    let current = result;

    keys.forEach((k, index) => {
      if (index === keys.length - 1) {
        current[k] = value;
      } else {
        current[k] = current[k] || {};
        current = current[k];
      }
    });
  });

  return result;
}

/**
 * Data Type Converters
 *
 * Utilities for converting between different data types
 */

/**
 * Convert string to boolean
 */
export function stringToBoolean(value: string): boolean {
  const truthyValues = ["true", "yes", "1", "on"];
  return truthyValues.includes(value.toLowerCase());
}

/**
 * Convert boolean to string
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
 * Convert array to object
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
 * Convert object to array
 */
export function objectToArray<T>(obj: Record<string, T>): T[] {
  return Object.values(obj);
}

/**
 * Convert query string to object
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
 * Convert object to query string
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
 * Convert CSV string to array of objects
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
 * Convert array of objects to CSV string
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
 * Convert Firestore timestamp to Date
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
 * Convert Date to ISO string
 */
export function dateToISOString(date: Date | string): string {
  return typeof date === "string"
    ? new Date(date).toISOString()
    : date.toISOString();
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Flatten nested object
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
 * Unflatten object
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

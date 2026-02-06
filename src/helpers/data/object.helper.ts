/**
 * Object Data Helpers
 *
 * Business logic helpers for object data operations
 */

/**
 * Deep merge two objects
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>,
): T {
  const output = { ...target };

  Object.keys(source).forEach((key) => {
    const sourceValue = source[key as keyof T];
    const targetValue = target[key as keyof T];

    if (
      sourceValue &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === "object" &&
      !Array.isArray(targetValue)
    ) {
      output[key as keyof T] = deepMerge(targetValue, sourceValue);
    } else {
      output[key as keyof T] = sourceValue as T[keyof T];
    }
  });

  return output;
}

/**
 * Pick specific keys from object
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * Omit specific keys from object
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result;
}

/**
 * Check if object is empty
 */
export function isEmptyObject(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Get nested property value
 */
export function getNestedValue<T>(obj: any, path: string): T | undefined {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}

/**
 * Set nested property value
 */
export function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split(".");
  const lastKey = keys.pop()!;

  const target = keys.reduce((current, key) => {
    if (!(key in current)) {
      current[key] = {};
    }
    return current[key];
  }, obj);

  target[lastKey] = value;
}

/**
 * Deep clone object
 */
export function deepCloneObject<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepCloneObject(item)) as unknown as T;
  }

  const cloned = {} as T;
  Object.keys(obj).forEach((key) => {
    cloned[key as keyof T] = deepCloneObject((obj as any)[key]);
  });

  return cloned;
}

/**
 * Compare two objects for equality
 */
export function isEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;

  if (
    typeof obj1 !== "object" ||
    typeof obj2 !== "object" ||
    obj1 === null ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  return keys1.every((key) => isEqual(obj1[key], obj2[key]));
}

/**
 * Clean object (remove null, undefined, empty strings)
 */
export function cleanObject<T extends Record<string, any>>(
  obj: T,
  options: {
    removeEmpty?: boolean;
    removeNull?: boolean;
    removeUndefined?: boolean;
  } = {},
): Partial<T> {
  const {
    removeEmpty = true,
    removeNull = true,
    removeUndefined = true,
  } = options;

  return Object.entries(obj).reduce((acc, [key, value]) => {
    const shouldRemove =
      (removeUndefined && value === undefined) ||
      (removeNull && value === null) ||
      (removeEmpty && value === "");

    if (!shouldRemove) {
      acc[key as keyof T] = value;
    }

    return acc;
  }, {} as Partial<T>);
}

/**
 * Invert object (swap keys and values)
 */
export function invertObject(
  obj: Record<string, string>,
): Record<string, string> {
  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      acc[value] = key;
      return acc;
    },
    {} as Record<string, string>,
  );
}

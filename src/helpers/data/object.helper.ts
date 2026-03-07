/**
 * Object Data Helpers
 *
 * Business logic helpers for object data operations
 */

/**
 * Performs a deep merge of two objects, recursively merging nested objects
 *
 * @param target - The target object to merge into
 * @param source - The source object to merge from
 * @returns A new object with merged properties
 *
 * @example
 * ```typescript
 * const defaults = { a: 1, b: { c: 2 } };
 * const custom = { b: { d: 3 } };
 * const result = deepMerge(defaults, custom);
 * console.log(result); // { a: 1, b: { c: 2, d: 3 } }
 * ```
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
 * Creates a new object with only the specified keys from the source object
 *
 * @param obj - The source object
 * @param keys - Array of keys to include
 * @returns A new object with only the picked keys
 *
 * @example
 * ```typescript
 * const user = { id: 1, name: 'Alice', email: 'alice@example.com', password: 'secret' };
 * const safe = pick(user, ['id', 'name', 'email']);
 * console.log(safe); // { id: 1, name: 'Alice', email: 'alice@example.com' }
 * ```
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
 * Creates a new object excluding the specified keys from the source object
 *
 * @param obj - The source object
 * @param keys - Array of keys to exclude
 * @returns A new object without the omitted keys
 *
 * @example
 * ```typescript
 * const user = { id: 1, name: 'Alice', password: 'secret' };
 * const safe = omit(user, ['password']);
 * console.log(safe); // { id: 1, name: 'Alice' }
 * ```
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
 * Checks if an object has no properties
 *
 * @param obj - The object to check
 * @returns True if the object is empty
 *
 * @example
 * ```typescript
 * console.log(isEmptyObject({})); // true
 * console.log(isEmptyObject({ a: 1 })); // false
 * ```
 */
export function isEmptyObject(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Creates a deep clone of an object, handling nested objects and arrays
 * Properly handles null values, arrays, and deeply nested structures
 *
 * @param obj - The object to clone
 * @returns A deep copy of the object
 *
 * @example
 * ```typescript
 * const original = { a: 1, b: { c: 2 } };
 * const clone = deepClone(original);
 * clone.b.c = 3;
 * console.log(original.b.c); // 2 (unchanged)
 * ```
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as unknown as T;
  }

  const cloned = {} as T;
  Object.keys(obj).forEach((key) => {
    cloned[key as keyof T] = deepClone((obj as any)[key]);
  });

  return cloned;
}

/**
 * Performs a deep equality comparison of two values
 *
 * @param obj1 - The first value to compare
 * @param obj2 - The second value to compare
 * @returns True if values are deeply equal
 *
 * @example
 * ```typescript
 * console.log(isEqual({ a: 1 }, { a: 1 })); // true
 * console.log(isEqual({ a: 1 }, { a: 2 })); // false
 * ```
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
 * Removes null, undefined, and/or empty string values from an object
 *
 * @param obj - The object to clean
 * @param options - Configuration for what to remove
 * @returns A new object without the specified empty values
 *
 * @example
 * ```typescript
 * const data = { a: 1, b: null, c: '', d: undefined };
 * const result = cleanObject(data);
 * console.log(result); // { a: 1 }
 * ```
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

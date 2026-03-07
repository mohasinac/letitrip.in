/**
 * Array Data Helpers
 *
 * Business logic helpers for array data operations
 */

/**
 * Groups array items by a specified key property
 *
 * @param array - The array to group
 * @param key - The property key to group by
 * @returns An object with grouped arrays keyed by the property value
 *
 * @example
 * ```typescript
 * const users = [{ city: 'NYC', name: 'Alice' }, { city: 'LA', name: 'Bob' }];
 * const grouped = groupBy(users, 'city');
 * console.log(grouped); // { NYC: [{...}], LA: [{...}] }
 * ```
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (result, item) => {
      const groupKey = String(item[key]);
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    },
    {} as Record<string, T[]>,
  );
}

/**
 * Removes duplicate values from an array
 *
 * @param array - The array to deduplicate
 * @returns A new array with only unique values
 *
 * @example
 * ```typescript
 * const result = unique([1, 2, 2, 3, 3, 3]);
 * console.log(result); // [1, 2, 3]
 * ```
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Removes duplicates from an array based on a specific property
 *
 * @param array - The array of objects to deduplicate
 * @param key - The property to use for uniqueness check
 * @returns A new array with unique items based on the key
 *
 * @example
 * ```typescript
 * const users = [{ id: 1, name: 'Alice' }, { id: 1, name: 'Alice2' }];
 * const result = uniqueBy(users, 'id');
 * console.log(result); // [{ id: 1, name: 'Alice' }]
 * ```
 */
export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

/**
 * Sorts an array by a specified property
 *
 * @param array - The array to sort
 * @param key - The property to sort by
 * @param order - Sort direction: 'asc' or 'desc' (default: 'asc')
 * @returns A new sorted array
 *
 * @example
 * ```typescript
 * const users = [{ age: 30 }, { age: 20 }, { age: 25 }];
 * const result = sortBy(users, 'age', 'asc');
 * console.log(result); // [{ age: 20 }, { age: 25 }, { age: 30 }]
 * ```
 */
export function sortBy<T>(
  array: T[],
  key: keyof T,
  order: "asc" | "desc" = "asc",
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  });
}

/**
 * Splits an array into smaller arrays of a specified size
 *
 * @param array - The array to chunk
 * @param size - The size of each chunk
 * @returns An array of chunked arrays
 *
 * @example
 * ```typescript
 * const result = chunk([1, 2, 3, 4, 5], 2);
 * console.log(result); // [[1, 2], [3, 4], [5]]
 * ```
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Paginates an array and returns page metadata
 *
 * @param array - The array to paginate
 * @param page - The page number (1-based)
 * @param perPage - Number of items per page
 * @returns Object with paginated data and metadata
 *
 * @example
 * ```typescript
 * const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
 * const result = paginate(items, 2, 3);
 * console.log(result.data); // [4, 5, 6]
 * console.log(result.totalPages); // 4
 * ```
 */
export function paginate<T>(
  array: T[],
  page: number,
  perPage: number,
): {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
} {
  const total = array.length;
  const totalPages = Math.ceil(total / perPage);
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const data = array.slice(start, end);

  return {
    data,
    total,
    page,
    perPage,
    totalPages,
  };
}

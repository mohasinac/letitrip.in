/**
 * Sorting Helper
 *
 * Business logic helpers for sorting operations
 */

export type SortOrder = "asc" | "desc";

export interface SortConfig<T> {
  key: keyof T;
  order: SortOrder;
}

/**
 * Sorts an array by a specified property key
 *
 * @param array - The array to sort
 * @param key - The property to sort by
 * @param order - Sort direction: 'asc' or 'desc' (default: 'asc')
 * @returns A new sorted array
 *
 * @example
 * ```typescript
 * const products = [{ price: 30 }, { price: 10 }, { price: 20 }];
 * const sorted = sort(products, 'price', 'asc');
 * console.log(sorted); // [{ price: 10 }, { price: 20 }, { price: 30 }]
 * ```
 */
export function sort<T>(
  array: T[],
  key: keyof T,
  order: SortOrder = "asc",
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
 * Sorts an array by multiple keys in order of priority
 *
 * @param array - The array to sort
 * @param configs - Array of sort configurations, applied in order
 * @returns A new sorted array
 *
 * @example
 * ```typescript
 * const users = [{ name: 'Bob', age: 30 }, { name: 'Alice', age: 30 }];
 * const sorted = multiSort(users, [
 *   { key: 'age', order: 'desc' },
 *   { key: 'name', order: 'asc' }
 * ]);
 * ```
 *
 * @deprecated Not currently used in the codebase. Retained for potential future use.
 */
export function multiSort<T>(array: T[], configs: SortConfig<T>[]): T[] {
  return [...array].sort((a, b) => {
    for (const config of configs) {
      const { key, order } = config;
      const aVal = a[key];
      const bVal = b[key];

      if (aVal < bVal) return order === "asc" ? -1 : 1;
      if (aVal > bVal) return order === "asc" ? 1 : -1;
    }
    return 0;
  });
}

/**
 * Sorts an array by a date property
 *
 * @param array - The array to sort
 * @param key - The date property to sort by
 * @param order - Sort direction: 'asc' or 'desc' (default: 'asc')
 * @returns A new sorted array
 *
 * @example
 * ```typescript
 * const events = [{ date: '2024-03-15' }, { date: '2024-01-10' }];
 * const sorted = sortByDate(events, 'date', 'asc');
 * ```
 *
 * @deprecated Not currently used in the codebase. Retained for potential future use.
 */
export function sortByDate<T>(
  array: T[],
  key: keyof T,
  order: SortOrder = "asc",
): T[] {
  return [...array].sort((a, b) => {
    const aDate = new Date(a[key] as any).getTime();
    const bDate = new Date(b[key] as any).getTime();

    if (order === "asc") {
      return aDate - bDate;
    }
    return bDate - aDate;
  });
}

/**
 * Sorts an array by a string property (case-insensitive)
 *
 * @param array - The array to sort
 * @param key - The string property to sort by
 * @param order - Sort direction: 'asc' or 'desc' (default: 'asc')
 * @returns A new sorted array
 *
 * @example
 * ```typescript
 * const users = [{ name: 'bob' }, { name: 'Alice' }];
 * const sorted = sortByString(users, 'name', 'asc');
 * console.log(sorted); // [{ name: 'Alice' }, { name: 'bob' }]
 * ```
 *
 * @deprecated Not currently used in the codebase. Retained for potential future use.
 */
export function sortByString<T>(
  array: T[],
  key: keyof T,
  order: SortOrder = "asc",
): T[] {
  return [...array].sort((a, b) => {
    const aStr = String(a[key]).toLowerCase();
    const bStr = String(b[key]).toLowerCase();

    if (aStr < bStr) return order === "asc" ? -1 : 1;
    if (aStr > bStr) return order === "asc" ? 1 : -1;
    return 0;
  });
}

/**
 * Sorts an array by a numeric property
 *
 * @param array - The array to sort
 * @param key - The numeric property to sort by
 * @param order - Sort direction: 'asc' or 'desc' (default: 'asc')
 * @returns A new sorted array
 *
 * @example
 * ```typescript
 * const items = [{ quantity: 5 }, { quantity: 2 }, { quantity: 8 }];
 * const sorted = sortByNumber(items, 'quantity', 'desc');
 * console.log(sorted); // [{ quantity: 8 }, { quantity: 5 }, { quantity: 2 }]
 * ```
 *
 * @deprecated Not currently used in the codebase. Retained for potential future use.
 */
export function sortByNumber<T>(
  array: T[],
  key: keyof T,
  order: SortOrder = "asc",
): T[] {
  return [...array].sort((a, b) => {
    const aNum = Number(a[key]);
    const bNum = Number(b[key]);

    if (order === "asc") {
      return aNum - bNum;
    }
    return bNum - aNum;
  });
}

/**
 * Toggles the sort order between ascending and descending
 *
 * @param currentOrder - The current sort order
 * @returns The opposite sort order
 *
 * @example
 * ```typescript
 * const newOrder = toggleSortOrder('asc');
 * console.log(newOrder); // 'desc'
 * ```
 *
 * @deprecated Not currently used in the codebase. Retained for potential future use.
 */
export function toggleSortOrder(currentOrder: SortOrder): SortOrder {
  return currentOrder === "asc" ? "desc" : "asc";
}

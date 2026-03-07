/**
 * Sorting Helper
 *
 * Business logic helpers for sorting operations
 */

export type SortOrder = "asc" | "desc";

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

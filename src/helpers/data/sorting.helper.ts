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
 * Generic sort function
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
 * Multi-level sort
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
 * Sort by date
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
 * Sort by string (case-insensitive)
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
 * Sort by number
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
 * Toggle sort order
 */
export function toggleSortOrder(currentOrder: SortOrder): SortOrder {
  return currentOrder === "asc" ? "desc" : "asc";
}

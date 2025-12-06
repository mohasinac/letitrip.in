/**
 * @fileoverview Array Helper Utilities
 * @module src/lib/array-helpers
 * @description Common array operations and transformations
 *
 * @created 2025-12-06
 * @pattern Helper Utility
 */

/**
 * Remove duplicates from array
 * @example unique([1, 2, 2, 3]) => [1, 2, 3]
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Remove duplicates from array of objects by key
 * @example uniqueBy([{id:1},{id:1},{id:2}], 'id') => [{id:1},{id:2}]
 */
export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter((item) => {
    const val = item[key];
    if (seen.has(val)) return false;
    seen.add(val);
    return true;
  });
}

/**
 * Group array of objects by key
 * @example groupBy([{type:'a',val:1},{type:'a',val:2},{type:'b',val:3}], 'type')
 * => { a: [{type:'a',val:1},{type:'a',val:2}], b: [{type:'b',val:3}] }
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Sort array of objects by key
 * @example sortBy([{age:30},{age:20}], 'age') => [{age:20},{age:30}]
 */
export function sortBy<T>(
  array: T[],
  key: keyof T,
  order: "asc" | "desc" = "asc"
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
 * Chunk array into smaller arrays
 * @example chunk([1,2,3,4,5], 2) => [[1,2],[3,4],[5]]
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Get random item from array
 * @example randomItem([1,2,3]) => 2 (random)
 */
export function randomItem<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get random items from array
 * @example randomItems([1,2,3,4,5], 2) => [3, 1] (random)
 */
export function randomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Shuffle array (Fisher-Yates algorithm)
 * @example shuffle([1,2,3,4]) => [3,1,4,2] (random order)
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get intersection of two arrays
 * @example intersection([1,2,3], [2,3,4]) => [2,3]
 */
export function intersection<T>(arr1: T[], arr2: T[]): T[] {
  const set2 = new Set(arr2);
  return arr1.filter((item) => set2.has(item));
}

/**
 * Get difference between two arrays (items in arr1 but not arr2)
 * @example difference([1,2,3], [2,3,4]) => [1]
 */
export function difference<T>(arr1: T[], arr2: T[]): T[] {
  const set2 = new Set(arr2);
  return arr1.filter((item) => !set2.has(item));
}

/**
 * Flatten nested array one level
 * @example flatten([[1,2],[3,4]]) => [1,2,3,4]
 */
export function flatten<T>(array: T[][]): T[] {
  return array.reduce((flat, item) => flat.concat(item), []);
}

/**
 * Deep flatten nested arrays
 * @example flattenDeep([[1,[2,[3]]],4]) => [1,2,3,4]
 */
export function flattenDeep(array: any[]): any[] {
  return array.reduce(
    (flat, item) => flat.concat(Array.isArray(item) ? flattenDeep(item) : item),
    []
  );
}

/**
 * Compact array (remove falsy values)
 * @example compact([0, 1, false, 2, '', 3, null]) => [1, 2, 3]
 */
export function compact<T>(
  array: (T | null | undefined | false | 0 | "")[]
): T[] {
  return array.filter(Boolean) as T[];
}

/**
 * Get first n items from array
 * @example take([1,2,3,4,5], 3) => [1,2,3]
 */
export function take<T>(array: T[], count: number): T[] {
  return array.slice(0, count);
}

/**
 * Get last n items from array
 * @example takeLast([1,2,3,4,5], 3) => [3,4,5]
 */
export function takeLast<T>(array: T[], count: number): T[] {
  return array.slice(-count);
}

/**
 * Partition array into two arrays based on predicate
 * @example partition([1,2,3,4], x => x % 2 === 0) => [[2,4], [1,3]]
 */
export function partition<T>(
  array: T[],
  predicate: (item: T) => boolean
): [T[], T[]] {
  const pass: T[] = [];
  const fail: T[] = [];

  array.forEach((item) => {
    if (predicate(item)) pass.push(item);
    else fail.push(item);
  });

  return [pass, fail];
}

/**
 * Sum array of numbers
 * @example sum([1,2,3,4]) => 10
 */
export function sum(array: number[]): number {
  return array.reduce((total, num) => total + num, 0);
}

/**
 * Average of array of numbers
 * @example average([1,2,3,4]) => 2.5
 */
export function average(array: number[]): number {
  if (array.length === 0) return 0;
  return sum(array) / array.length;
}

/**
 * Move item in array from one index to another
 * @example moveItem([1,2,3,4], 0, 2) => [2,3,1,4]
 */
export function moveItem<T>(
  array: T[],
  fromIndex: number,
  toIndex: number
): T[] {
  const result = [...array];
  const [item] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, item);
  return result;
}

/**
 * Range of numbers
 * @example range(1, 5) => [1,2,3,4,5]
 * @example range(0, 10, 2) => [0,2,4,6,8,10]
 */
export function range(start: number, end: number, step: number = 1): number[] {
  const result: number[] = [];
  for (let i = start; i <= end; i += step) {
    result.push(i);
  }
  return result;
}

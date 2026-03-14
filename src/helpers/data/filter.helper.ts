/**
 * Filter Helper
 *
 * Pure string utility for building Sieve filter expressions from
 * filter entries. Each entry is a tuple of [expressionPrefix, value]:
 *
 * @example
 * ```ts
 * const filters = buildSieveFilters(
 *   ["status==", statusFilter],
 *   ["totalPrice>=", minAmount],
 *   ["title@=*", searchTerm],
 * );
 * // → "status==pending,totalPrice>=100,title@=*shoes"
 * ```
 */

type FilterEntry = [expression: string, value: string | undefined | null];

export function buildSieveFilters(...entries: FilterEntry[]): string {
  return entries
    .filter((entry): entry is [string, string] => !!entry[1])
    .map(([expr, value]) => `${expr}${value}`)
    .join(",");
}

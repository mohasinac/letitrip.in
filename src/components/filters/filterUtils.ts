/**
 * Utility helpers for filter option arrays.
 *
 * Designed for any `{ value: string; label: string }[]` options list —
 * works with FilterFacetSection, SortDropdown, SwitchFilter, etc.
 *
 * @example
 * const label = getFilterLabel(statusOptions, statusFilter) ?? statusFilter;
 * const value = getFilterValue(statusOptions, "Pending") ?? "";
 */

export type FilterOption = { value: string; label: string };

/**
 * Returns the `label` for the option whose `value` matches `value`.
 * Returns `undefined` when no match is found.
 */
export function getFilterLabel(
  options: ReadonlyArray<FilterOption>,
  value: string,
): string | undefined {
  return options.find((o) => o.value === value)?.label;
}

/**
 * Returns the `value` for the option whose `label` matches `label`.
 * Returns `undefined` when no match is found.
 */
export function getFilterValue(
  options: ReadonlyArray<FilterOption>,
  label: string,
): string | undefined {
  return options.find((o) => o.label === label)?.value;
}

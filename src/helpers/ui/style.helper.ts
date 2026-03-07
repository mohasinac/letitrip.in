/**
 * Style Helpers
 *
 * UI helpers for dynamic styling and CSS class management
 */

/**
 * Conditionally joins class names, filtering out falsy values
 *
 * @param classes - Variable number of class names or falsy values
 * @returns A space-separated string of class names
 *
 * @example
 * ```typescript
 * const btnClass = classNames('btn', isActive && 'active', isPrimary && 'primary');
 * console.log(btnClass); // 'btn active primary' (if both conditions are true)
 * ```
 */
export function classNames(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Merges multiple Tailwind CSS classes, removing duplicates
 *
 * @param classes - Variable number of class strings
 * @returns A deduplicated string of Tailwind classes
 *
 * @example
 * ```typescript
 * const merged = mergeTailwindClasses('px-4 py-2', 'px-6 bg-blue-500');
 * console.log(merged); // 'px-4 py-2 px-6 bg-blue-500'
 * ```
 */
export function mergeTailwindClasses(
  ...classes: (string | undefined | null)[]
): string {
  const classArray = classes.filter(Boolean).join(" ").split(" ");
  const uniqueClasses = Array.from(new Set(classArray));
  return uniqueClasses.join(" ");
}

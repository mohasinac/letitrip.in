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

/**
 * Generates responsive class names for different breakpoints
 *
 * @param baseClass - The base class name
 * @param breakpoints - Object with breakpoint-specific class names
 * @returns A string with responsive classes
 *
 * @example
 * ```typescript
 * const classes = responsive('text-base', { md: 'text-lg', lg: 'text-xl' });
 * console.log(classes); // 'text-base md:text-lg lg:text-xl'
 * ```
 *
 * @deprecated Not currently used in the codebase. Retained for potential future use.
 */
export function responsive(
  baseClass: string,
  breakpoints: Partial<Record<"sm" | "md" | "lg" | "xl" | "2xl", string>>,
): string {
  const classes = [baseClass];

  Object.entries(breakpoints).forEach(([breakpoint, value]) => {
    if (value) {
      classes.push(`${breakpoint}:${value}`);
    }
  });

  return classes.join(" ");
}

/**
 * Generates variant classes based on a variant value
 *
 * @param baseClass - The base class name
 * @param variantClass - The variant class category (unused in implementation)
 * @param variantValue - The current variant value
 * @param variants - Object mapping variant values to classes
 * @returns Combined base and variant classes
 *
 * @example
 * ```typescript
 * const buttonClasses = variant('btn', 'color', 'primary', {
 *   primary: 'bg-blue-500',
 *   secondary: 'bg-gray-500'
 * });
 * console.log(buttonClasses); // 'btn bg-blue-500'
 * ```
 *
 * @deprecated Not currently used in the codebase. Retained for potential future use.
 */
export function variant<T extends string>(
  baseClass: string,
  variantClass: string,
  variantValue: T,
  variants: Record<T, string>,
): string {
  return classNames(baseClass, variants[variantValue]);
}

/**
 * Returns a class name based on a boolean condition
 *
 * @param condition - The condition to evaluate
 * @param trueClass - Class name to return when condition is true
 * @param falseClass - Optional class name to return when condition is false
 * @returns The appropriate class name
 *
 * @example
 * ```typescript
 * const statusClass = toggleClass(isActive, 'text-green-500', 'text-gray-500');
 * console.log(statusClass); // 'text-green-500' if isActive is true
 * ```
 *
 * @deprecated Not currently used in the codebase. Retained for potential future use.
 */
export function toggleClass(
  condition: boolean,
  trueClass: string,
  falseClass?: string,
): string {
  return condition ? trueClass : falseClass || "";
}

/**
 * Returns the class name for a specific size from a size map
 *
 * @param size - The size value
 * @param sizeMap - Object mapping size values to class names
 * @returns The class name for the size (falls back to 'md')
 *
 * @example
 * ```typescript
 * const paddingClass = sizeClass('lg', {
 *   xs: 'p-1',
 *   sm: 'p-2',
 *   md: 'p-4',
 *   lg: 'p-6',
 *   xl: 'p-8'
 * });
 * console.log(paddingClass); // 'p-6'
 * ```
 *
 * @deprecated Not currently used in the codebase. Retained for potential future use.
 */
export function sizeClass(
  size: "xs" | "sm" | "md" | "lg" | "xl",
  sizeMap: Record<string, string>,
): string {
  return sizeMap[size] || sizeMap.md;
}

/**
 * Style Helpers
 *
 * UI helpers for dynamic styling and CSS class management
 */

/**
 * Conditionally join class names
 */
export function classNames(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Alias for classNames (common naming convention)
 */
export const cn = classNames;

/**
 * Merge Tailwind classes (with conflict resolution)
 */
export function mergeTailwindClasses(
  ...classes: (string | undefined | null)[]
): string {
  const classArray = classes.filter(Boolean).join(" ").split(" ");
  const uniqueClasses = Array.from(new Set(classArray));
  return uniqueClasses.join(" ");
}

/**
 * Generate responsive class names
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
 * Generate variant classes
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
 * Toggle class based on condition
 */
export function toggleClass(
  condition: boolean,
  trueClass: string,
  falseClass?: string,
): string {
  return condition ? trueClass : falseClass || "";
}

/**
 * Generate size classes
 */
export function sizeClass(
  size: "xs" | "sm" | "md" | "lg" | "xl",
  sizeMap: Record<string, string>,
): string {
  return sizeMap[size] || sizeMap.md;
}

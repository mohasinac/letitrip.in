import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx and tailwind-merge
 *
 * This utility function combines multiple class names and intelligently
 * merges Tailwind CSS classes to prevent conflicts.
 *
 * @param inputs - Class names to merge (strings, objects, arrays)
 * @returns Merged class string
 *
 * @example
 * ```tsx
 * cn('px-2 py-1', 'px-4') // => 'py-1 px-4' (px-4 overwrites px-2)
 * cn('text-red-500', condition && 'text-blue-500') // conditional classes
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

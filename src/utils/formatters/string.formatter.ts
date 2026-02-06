/**
 * String Formatting Utilities
 *
 * Centralized string formatting and manipulation functions
 */

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Capitalize all words
 */
export function capitalizeWords(str: string): string {
  return str
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
}

/**
 * Convert to camelCase
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) =>
      index === 0 ? letter.toLowerCase() : letter.toUpperCase(),
    )
    .replace(/\s+/g, "");
}

/**
 * Convert to PascalCase
 */
export function toPascalCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter) => letter.toUpperCase())
    .replace(/\s+/g, "");
}

/**
 * Convert to snake_case
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/^_/, "")
    .replace(/\s+/g, "_");
}

/**
 * Convert to kebab-case
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/^-/, "")
    .replace(/\s+/g, "-");
}

/**
 * Truncate string with ellipsis
 */
export function truncate(
  str: string,
  maxLength: number,
  suffix: string = "...",
): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Truncate words (preserve word boundaries)
 */
export function truncateWords(
  str: string,
  wordCount: number,
  suffix: string = "...",
): string {
  const words = str.split(" ");
  if (words.length <= wordCount) return str;
  return words.slice(0, wordCount).join(" ") + suffix;
}

/**
 * Remove HTML tags
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

/**
 * Escape HTML entities
 */
export function escapeHtml(str: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return str.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Generate slug from string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Mask string (e.g., credit card, email)
 */
export function maskString(
  str: string,
  visibleStart: number = 4,
  visibleEnd: number = 4,
  maskChar: string = "*",
): string {
  if (str.length <= visibleStart + visibleEnd) return str;

  const start = str.slice(0, visibleStart);
  const end = str.slice(-visibleEnd);
  const masked = maskChar.repeat(str.length - visibleStart - visibleEnd);

  return start + masked + end;
}

/**
 * Generate random string
 */
export function randomString(length: number = 10): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

/**
 * Check if string is empty or whitespace
 */
export function isEmptyString(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Count words in string
 */
export function wordCount(str: string): number {
  return str.trim().split(/\s+/).length;
}

/**
 * Reverse string
 */
export function reverse(str: string): string {
  return str.split("").reverse().join("");
}

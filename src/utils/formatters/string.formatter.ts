/**
 * String Formatting Utilities
 *
 * Centralized string formatting and manipulation functions
 */

/**
 * Capitalizes the first letter of a string and lowercases the rest
 *
 * @param str - The string to capitalize
 * @returns The capitalized string
 *
 * @example
 * ```typescript
 * const result = capitalize('hello world');
 * console.log(result); // 'Hello world'
 * ```
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Capitalizes the first letter of each word in a string
 *
 * @param str - The string to capitalize
 * @returns The string with all words capitalized
 *
 * @example
 * ```typescript
 * const result = capitalizeWords('hello world');
 * console.log(result); // 'Hello World'
 * ```
 */
export function capitalizeWords(str: string): string {
  return str
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
}

/**
 * Converts a string to camelCase format
 *
 * @param str - The string to convert
 * @returns The string in camelCase format
 *
 * @example
 * ```typescript
 * const result = toCamelCase('Hello World');
 * console.log(result); // 'helloWorld'
 * ```
 *
 * @deprecated Not currently used in the codebase. Retained for potential future use.
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) =>
      index === 0 ? letter.toLowerCase() : letter.toUpperCase(),
    )
    .replace(/\s+/g, "");
}

/**
 * Converts a string to PascalCase format
 *
 * @param str - The string to convert
 * @returns The string in PascalCase format
 *
 * @example
 * ```typescript
 * const result = toPascalCase('hello world');
 * console.log(result); // 'HelloWorld'
 * ```
 *
 * @deprecated Not currently used in the codebase. Retained for potential future use.
 */
export function toPascalCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter) => letter.toUpperCase())
    .replace(/\s+/g, "");
}

/**
 * Converts a string to snake_case format
 *
 * @param str - The string to convert
 * @returns The string in snake_case format
 *
 * @example
 * ```typescript
 * const result = toSnakeCase('helloWorld');
 * console.log(result); // 'hello_world'
 * ```
 *
 * @deprecated Not currently used in the codebase. Retained for potential future use.
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/^_/, "")
    .replace(/\s+/g, "_");
}

/**
 * Converts a string to kebab-case format
 *
 * @param str - The string to convert
 * @returns The string in kebab-case format
 *
 * @example
 * ```typescript
 * const result = toKebabCase('helloWorld');
 * console.log(result); // 'hello-world'
 * ```
 *
 * @deprecated Not currently used in the codebase. Retained for potential future use.
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/^-/, "")
    .replace(/\s+/g, "-");
}

/**
 * Truncates a string to a maximum length and adds a suffix if truncated
 *
 * @param str - The string to truncate
 * @param maxLength - The maximum length of the resulting string
 * @param suffix - The suffix to add when truncated (default: '...')
 * @returns The truncated string with suffix if applicable
 *
 * @example
 * ```typescript
 * const result = truncate('Hello World', 8);
 * console.log(result); // 'Hello...'
 * ```
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
 * Truncates a string to a maximum number of words, preserving word boundaries
 *
 * @param str - The string to truncate
 * @param wordCount - The maximum number of words
 * @param suffix - The suffix to add when truncated (default: '...')
 * @returns The truncated string with suffix if applicable
 *
 * @example
 * ```typescript
 * const result = truncateWords('Hello world from TypeScript', 2);
 * console.log(result); // 'Hello world...'
 * ```
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
 * Removes all HTML tags from a string
 *
 * @param html - The HTML string to process
 * @returns The plain text without HTML tags
 *
 * @example
 * ```typescript
 * const result = stripHtml('<p>Hello <strong>World</strong></p>');
 * console.log(result); // 'Hello World'
 * ```
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

/**
 * Escapes HTML special characters to prevent XSS attacks
 *
 * @param str - The string to escape
 * @returns The escaped string safe for HTML insertion
 *
 * @example
 * ```typescript
 * const result = escapeHtml('<script>alert("XSS")</script>');
 * console.log(result); // '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
 * ```
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
 * Converts a string to a URL-friendly slug
 *
 * @param str - The string to slugify
 * @returns A URL-safe slug with lowercase letters, numbers, and hyphens
 *
 * @example
 * ```typescript
 * const result = slugify('Hello World! This is a Test');
 * console.log(result); // 'hello-world-this-is-a-test'
 * ```
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
 * Masks a string while keeping specified characters visible at start and end
 *
 * @param str - The string to mask
 * @param visibleStart - Number of visible characters at the start (default: 4)
 * @param visibleEnd - Number of visible characters at the end (default: 4)
 * @param maskChar - The character to use for masking (default: '*')
 * @returns The masked string
 *
 * @example
 * ```typescript
 * const result = maskString('1234567890', 4, 4);
 * console.log(result); // '1234**7890'
 * ```
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
 * Generates a random alphanumeric string
 *
 * @param length - The length of the random string (default: 10)
 * @returns A random string containing letters and numbers
 *
 * @example
 * ```typescript
 * const result = randomString(8);
 * console.log(result); // 'aB3xY9zK' (example output)
 * ```
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
 * Checks if a string is empty, null, undefined, or contains only whitespace
 *
 * @param str - The string to check
 * @returns True if the string is empty or whitespace-only
 *
 * @example
 * ```typescript
 * console.log(isEmptyString('   ')); // true
 * console.log(isEmptyString('hello')); // false
 * ```
 */
export function isEmptyString(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Counts the number of words in a string
 *
 * @param str - The string to count words in
 * @returns The number of words in the string
 *
 * @example
 * ```typescript
 * const count = wordCount('Hello world from TypeScript');
 * console.log(count); // 4
 * ```
 *
 * @deprecated Not currently used in the codebase. Retained for potential future use.
 */
export function wordCount(str: string): number {
  return str.trim().split(/\s+/).length;
}

/**
 * Reverses the characters in a string
 *
 * @param str - The string to reverse
 * @returns The reversed string
 *
 * @example
 * ```typescript
 * const result = reverse('hello');
 * console.log(result); // 'olleh'
 * ```
 *
 * @deprecated Not currently used in the codebase. Retained for potential future use.
 */
export function reverse(str: string): string {
  return str.split("").reverse().join("");
}

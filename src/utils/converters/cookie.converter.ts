/**
 * Cookie Converter Utilities
 *
 * Client-side cookie parsing and helper functions.
 * Extracts manual cookie parsing from SessionContext into a reusable utility.
 */

/**
 * Parse all cookies from document.cookie into a key-value map
 *
 * @returns Record of cookie name → value pairs
 *
 * @example
 * ```ts
 * const cookies = parseCookies();
 * const sessionId = cookies['__session_id'];
 * ```
 */
export function parseCookies(): Record<string, string> {
  if (typeof document === "undefined") return {};

  const result: Record<string, string> = {};
  const cookies = document.cookie.split(";");

  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.trim().split("=");
    if (name) {
      result[name.trim()] = decodeURIComponent(valueParts.join("="));
    }
  }

  return result;
}

/**
 * Get a specific cookie value by name
 *
 * @param name - Cookie name to look up
 * @returns The cookie value or null if not found
 *
 * @example
 * ```ts
 * const sessionId = getCookie('__session_id');
 * ```
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [cookieName, ...valueParts] = cookie.trim().split("=");
    if (cookieName?.trim() === name) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return null;
}

/**
 * Check if a specific cookie exists
 *
 * @param name - Cookie name to check
 * @returns true if the cookie exists
 *
 * @example
 * ```ts
 * if (hasCookie('__session_id')) { ... }
 * ```
 */
export function hasCookie(name: string): boolean {
  return getCookie(name) !== null;
}

/**
 * Delete a cookie by setting its expiry to the past
 *
 * @param name - Cookie name to delete
 * @param path - Cookie path (default: '/')
 *
 * @example
 * ```ts
 * deleteCookie('__session_id');
 * ```
 */
export function deleteCookie(name: string, path: string = "/"): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
}

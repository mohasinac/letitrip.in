/**
 * URL Validation Utilities
 *
 * Centralized URL validation and checking
 */

/**
 * Validates a URL format
 *
 * @param url - The URL string to validate
 * @returns True if the URL is valid and can be parsed
 *
 * @example
 * ```typescript
 * console.log(isValidUrl('https://example.com')); // true
 * console.log(isValidUrl('not a url')); // false
 * ```
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates a URL and checks if it uses an allowed protocol
 *
 * @param url - The URL string to validate
 * @param protocols - Array of allowed protocols (default: ['http', 'https'])
 * @returns True if the URL is valid and uses an allowed protocol
 *
 * @example
 * ```typescript
 * console.log(isValidUrlWithProtocol('https://example.com')); // true
 * console.log(isValidUrlWithProtocol('ftp://example.com', ['http', 'https'])); // false
 * ```
 */
export function isValidUrlWithProtocol(
  url: string,
  protocols: string[] = ["http", "https"],
): boolean {
  if (!isValidUrl(url)) return false;

  try {
    const urlObj = new URL(url);
    return protocols.includes(urlObj.protocol.replace(":", ""));
  } catch {
    return false;
  }
}

/**
 * Checks if a URL points to an external domain
 *
 * @param url - The URL to check
 * @param currentDomain - Optional current domain to compare against (uses window.location if not provided)
 * @returns True if the URL's hostname differs from the current domain
 *
 * @example
 * ```typescript
 * console.log(isExternalUrl('https://google.com', 'example.com')); // true
 * console.log(isExternalUrl('https://example.com/page', 'example.com')); // false
 * ```
 */
export function isExternalUrl(url: string, currentDomain?: string): boolean {
  if (!isValidUrl(url)) return false;

  try {
    const urlObj = new URL(url);
    const currentHost =
      currentDomain ||
      (typeof window !== "undefined" ? window.location.hostname : "");
    return urlObj.hostname !== currentHost;
  } catch {
    return false;
  }
}

/**
 * Sanitizes a URL by removing dangerous protocols that could execute scripts
 *
 * @param url - The URL to sanitize
 * @returns A safe URL or 'about:blank' if dangerous protocol detected
 *
 * @example
 * ```typescript
 * console.log(sanitizeUrl('https://example.com')); // 'https://example.com'
 * console.log(sanitizeUrl('javascript:alert("XSS")')); // 'about:blank'
 * ```
 */
export function sanitizeUrl(url: string): string {
  const dangerousProtocols = ["javascript:", "data:", "vbscript:"];

  for (const protocol of dangerousProtocols) {
    if (url.toLowerCase().startsWith(protocol)) {
      return "about:blank";
    }
  }

  return url;
}

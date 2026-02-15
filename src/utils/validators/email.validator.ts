/**
 * Email Validation Utilities
 *
 * Centralized email validation functions
 */

/**
 * Validates an email address format using regex
 *
 * @param email - The email address to validate
 * @returns True if the email format is valid
 *
 * @example
 * ```typescript
 * console.log(isValidEmail('user@example.com')); // true
 * console.log(isValidEmail('invalid.email')); // false
 * ```
 */
export function isValidEmail(email: string): boolean {
  // More comprehensive regex that disallows consecutive dots and other invalid patterns
  const emailRegex =
    /^[^\s@]+@[^\s@.][^\s@]*[^\s@.]\.[^\s@]+$|^[^\s@]+@[^\s@.]\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;

  // Additional check to disallow consecutive dots
  if (email.includes("..")) return false;

  return true;
}

/**
 * Validates an email address against allowed domains
 *
 * @param email - The email address to validate
 * @param allowedDomains - Optional array of allowed domain names
 * @returns True if email format is valid and domain is allowed
 *
 * @example
 * ```typescript
 * console.log(isValidEmailDomain('user@company.com', ['company.com'])); // true
 * console.log(isValidEmailDomain('user@other.com', ['company.com'])); // false
 * ```
 */
export function isValidEmailDomain(
  email: string,
  allowedDomains?: string[],
): boolean {
  if (!isValidEmail(email)) return false;

  if (!allowedDomains || allowedDomains.length === 0) return true;

  const domain = email.split("@")[1].toLowerCase();
  return allowedDomains.some((allowed) => domain === allowed.toLowerCase());
}

/**
 * Normalizes an email address by trimming whitespace and converting to lowercase
 *
 * @param email - The email address to normalize
 * @returns The normalized email address
 *
 * @example
 * ```typescript
 * const result = normalizeEmail('  User@Example.COM  ');
 * console.log(result); // 'user@example.com'
 * ```
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Checks if an email address uses a disposable/temporary email service
 *
 * @param email - The email address to check
 * @returns True if the email domain is a known disposable email provider
 *
 * @example
 * ```typescript
 * console.log(isDisposableEmail('test@tempmail.com')); // true
 * console.log(isDisposableEmail('user@gmail.com')); // false
 * ```
 */
export function isDisposableEmail(email: string): boolean {
  const disposableDomains = [
    "tempmail.com",
    "10minutemail.com",
    "guerrillamail.com",
    "mailinator.com",
    "throwaway.email",
  ];

  const domain = email.split("@")[1]?.toLowerCase();
  return disposableDomains.includes(domain);
}

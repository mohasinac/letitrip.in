/**
 * Email Validation Utilities
 *
 * Centralized email validation functions
 */

/**
 * Validate email format using regex
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate email domain
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
 * Normalize email (lowercase, trim)
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Check if email is disposable
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

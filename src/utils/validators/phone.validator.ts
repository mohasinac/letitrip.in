/**
 * Phone Number Validation Utilities
 *
 * Centralized phone number validation and formatting
 */

/**
 * Validates an international phone number format
 *
 * @param phone - The phone number to validate (can include spaces, dashes, parentheses)
 * @returns True if the phone number is in a valid international format
 *
 * @example
 * ```typescript
 * console.log(isValidPhone('+1 234 567 8900')); // true
 * console.log(isValidPhone('1234567890')); // true
 * console.log(isValidPhone('abc')); // false
 * ```
 */
export function isValidPhone(phone: string): boolean {
  // Matches international format: +1234567890 or +1 234 567 8900
  const phoneRegex = /^\+?[\d\s-()]+$/;
  const cleaned = phone.replace(/[\s-()]/g, "");

  return phoneRegex.test(phone) && cleaned.length >= 10 && cleaned.length <= 15;
}

/**
 * Removes all formatting characters from a phone number
 *
 * @param phone - The phone number to normalize
 * @returns The phone number with only digits and optional leading +
 *
 * @example
 * ```typescript
 * const result = normalizePhone('(123) 456-7890');
 * console.log(result); // '1234567890'
 * ```
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/[\s-()]/g, "");
}

/**
 * Formats a phone number for display based on country conventions
 *
 * @param phone - The phone number to format
 * @param countryCode - The country code for formatting rules (default: 'US')
 * @returns The formatted phone number
 *
 * @example
 * ```typescript
 * const result = formatPhone('1234567890', 'US');
 * console.log(result); // '(123) 456-7890'
 * ```
 */
export function formatPhone(phone: string, countryCode: string = "US"): string {
  const cleaned = normalizePhone(phone);

  if (countryCode === "US" && cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  if (cleaned.startsWith("+")) {
    return cleaned;
  }

  return `+${cleaned}`;
}

/**
 * Extracts the country code from a phone number
 *
 * @param phone - The phone number containing a country code
 * @returns The country code with + prefix, or null if not found
 *
 * @example
 * ```typescript
 * const result = extractCountryCode('+1 234 567 8900');
 * console.log(result); // '+1'
 * const result2 = extractCountryCode('+91 98765 43210');
 * console.log(result2); // '+91'
 * ```
 */
export function extractCountryCode(phone: string): string | null {
  const cleaned = normalizePhone(phone);

  if (cleaned.startsWith("+1")) return "+1";
  if (cleaned.startsWith("+44")) return "+44";
  if (cleaned.startsWith("+91")) return "+91";

  const match = cleaned.match(/^\+(\d{1,3})/);
  return match ? `+${match[1]}` : null;
}

/**
 * Validates Indian mobile number (10 digits starting with 6-9)
 *
 * @param phone - The phone number to validate
 * @returns True if the phone number is a valid Indian mobile number
 *
 * @example
 * ```typescript
 * console.log(isValidIndianMobile('9876543210')); // true
 * console.log(isValidIndianMobile('5876543210')); // false (doesn't start with 6-9)
 * console.log(isValidIndianMobile('98765')); // false (not 10 digits)
 * ```
 */
export function isValidIndianMobile(phone: string): boolean {
  const cleaned = phone.replace(/[\s-()]/g, "");
  return /^[6-9]\d{9}$/.test(cleaned);
}

/**
 * Validates Indian pincode (6 digits)
 *
 * @param pincode - The pincode to validate
 * @returns True if the pincode is a valid 6-digit Indian pincode
 *
 * @example
 * ```typescript
 * console.log(isValidIndianPincode('110001')); // true
 * console.log(isValidIndianPincode('400001')); // true
 * console.log(isValidIndianPincode('1234')); // false (not 6 digits)
 * console.log(isValidIndianPincode('12345a')); // false (contains non-digit)
 * ```
 */
export function isValidIndianPincode(pincode: string): boolean {
  return /^\d{6}$/.test(pincode.trim());
}

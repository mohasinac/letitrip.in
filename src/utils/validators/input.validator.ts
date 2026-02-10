/**
 * General Input Validation Utilities
 *
 * Validation for various input types
 */

/**
 * Validates that a value is not empty, null, or undefined
 *
 * @param value - The value to validate
 * @returns True if the value is present and not empty
 *
 * @example
 * ```typescript
 * console.log(isRequired('hello')); // true
 * console.log(isRequired('')); // false
 * console.log(isRequired(null)); // false
 * ```
 */
export function isRequired(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * Validates that a string meets the minimum length requirement
 *
 * @param value - The string to validate
 * @param min - The minimum required length
 * @returns True if the string length is greater than or equal to min
 *
 * @example
 * ```typescript
 * console.log(minLength('hello', 3)); // true
 * console.log(minLength('hi', 5)); // false
 * ```
 */
export function minLength(value: string, min: number): boolean {
  return value.length >= min;
}

/**
 * Validates that a string does not exceed the maximum length
 *
 * @param value - The string to validate
 * @param max - The maximum allowed length
 * @returns True if the string length is less than or equal to max
 *
 * @example
 * ```typescript
 * console.log(maxLength('hello', 10)); // true
 * console.log(maxLength('hello world', 5)); // false
 * ```
 */
export function maxLength(value: string, max: number): boolean {
  return value.length <= max;
}

/**
 * Validates that a string has an exact length
 *
 * @param value - The string to validate
 * @param length - The required exact length
 * @returns True if the string length equals the specified length
 *
 * @example
 * ```typescript
 * console.log(exactLength('12345', 5)); // true
 * console.log(exactLength('1234', 5)); // false
 * ```
 */
export function exactLength(value: string, length: number): boolean {
  return value.length === length;
}

/**
 * Validates that a string represents a numeric value
 *
 * @param value - The string to validate
 * @returns True if the string can be parsed as a number
 *
 * @example
 * ```typescript
 * console.log(isNumeric('123')); // true
 * console.log(isNumeric('12.34')); // true
 * console.log(isNumeric('abc')); // false
 * ```
 */
export function isNumeric(value: string): boolean {
  return !isNaN(Number(value)) && !isNaN(parseFloat(value));
}

/**
 * Validates that a string contains only alphabetic characters
 *
 * @param value - The string to validate
 * @returns True if the string contains only letters (a-z, A-Z)
 *
 * @example
 * ```typescript
 * console.log(isAlphabetic('Hello')); // true
 * console.log(isAlphabetic('Hello123')); // false
 * ```
 *
 * @deprecated Not currently used in the codebase. Retained for potential future use.
 */
export function isAlphabetic(value: string): boolean {
  return /^[a-zA-Z]+$/.test(value);
}

/**
 * Validates that a string contains only alphanumeric characters
 *
 * @param value - The string to validate
 * @returns True if the string contains only letters and numbers
 *
 * @example
 * ```typescript
 * console.log(isAlphanumeric('Hello123')); // true
 * console.log(isAlphanumeric('Hello-123')); // false
 * ```
 *
 * @deprecated Not currently used in the codebase. Retained for potential future use.
 */
export function isAlphanumeric(value: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(value);
}

/**
 * Validates that a number falls within a specified range
 *
 * @param value - The number to validate
 * @param min - The minimum allowed value (inclusive)
 * @param max - The maximum allowed value (inclusive)
 * @returns True if the value is between min and max (inclusive)
 *
 * @example
 * ```typescript
 * console.log(inRange(5, 1, 10)); // true
 * console.log(inRange(15, 1, 10)); // false
 * ```
 */
export function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Validates that a value matches a regular expression pattern
 *
 * @param value - The string to validate
 * @param pattern - The regular expression to match against
 * @returns True if the value matches the pattern
 *
 * @example
 * ```typescript
 * const phonePattern = /^\d{3}-\d{3}-\d{4}$/;
 * console.log(matchesPattern('123-456-7890', phonePattern)); // true
 * ```
 */
export function matchesPattern(value: string, pattern: RegExp): boolean {
  return pattern.test(value);
}

/**
 * Validates that a value exists in a given list
 *
 * @param value - The value to check
 * @param list - The list of allowed values
 * @returns True if the value is found in the list
 *
 * @example
 * ```typescript
 * console.log(isInList('red', ['red', 'blue', 'green'])); // true
 * console.log(isInList('yellow', ['red', 'blue', 'green'])); // false
 * ```
 */
export function isInList<T>(value: T, list: T[]): boolean {
  return list.includes(value);
}

/**
 * Validates a credit card number using the Luhn algorithm
 *
 * @param cardNumber - The credit card number to validate (with or without spaces/dashes)
 * @returns True if the credit card number is valid according to Luhn algorithm
 *
 * @example
 * ```typescript
 * console.log(isValidCreditCard('4532015112830366')); // true (valid Visa)
 * console.log(isValidCreditCard('1234567890123456')); // false
 * ```
 *
 * @deprecated Not currently used in the codebase. Retained for potential future use.
 */
export function isValidCreditCard(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\D/g, "");

  if (cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Validates a postal/zip code for different countries
 *
 * @param code - The postal code to validate
 * @param countryCode - The country code ('US', 'CA', 'UK', 'IN') (default: 'US')
 * @returns True if the postal code matches the country's format
 *
 * @example
 * ```typescript
 * console.log(isValidPostalCode('12345', 'US')); // true
 * console.log(isValidPostalCode('M5H 2N2', 'CA')); // true
 * console.log(isValidPostalCode('110001', 'IN')); // true
 * ```
 *
 * @deprecated Not currently used in the codebase. Retained for potential future use.
 */
export function isValidPostalCode(
  code: string,
  countryCode: string = "US",
): boolean {
  const patterns: Record<string, RegExp> = {
    US: /^\d{5}(-\d{4})?$/,
    CA: /^[A-Z]\d[A-Z] \d[A-Z]\d$/,
    UK: /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/,
    IN: /^\d{6}$/,
  };

  const pattern = patterns[countryCode.toUpperCase()];
  return pattern ? pattern.test(code) : true;
}

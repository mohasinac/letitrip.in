/**
 * Number Formatting Utilities
 *
 * Centralized number formatting functions
 */

/**
 * Formats a number as currency with locale-specific formatting
 *
 * @param amount - The numeric amount to format
 * @param currency - The currency code (default: 'USD')
 * @param locale - The locale for formatting (default: 'en-US')
 * @returns The formatted currency string
 *
 * @example
 * ```typescript
 * const result = formatCurrency(1234.56);
 * console.log(result); // '$1,234.56'
 * ```
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Formats a number with thousand separators
 *
 * @param num - The number to format
 * @param locale - The locale for formatting (default: 'en-US')
 * @returns The formatted number string with thousand separators
 *
 * @example
 * ```typescript
 * const result = formatNumber(1234567);
 * console.log(result); // '1,234,567'
 * ```
 */
export function formatNumber(num: number, locale: string = "en-US"): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Formats a number as a percentage
 *
 * @param num - The decimal number to format (e.g., 0.75 for 75%)
 * @param decimals - Number of decimal places (default: 0)
 * @returns The formatted percentage string
 *
 * @example
 * ```typescript
 * const result = formatPercentage(0.7532, 2);
 * console.log(result); // '75.32%'
 * ```
 */
export function formatPercentage(num: number, decimals: number = 0): string {
  return `${(num * 100).toFixed(decimals)}%`;
}

/**
 * Formats a file size in bytes to a human-readable string
 *
 * @param bytes - The file size in bytes
 * @returns A formatted string with appropriate unit (Bytes, KB, MB, GB, TB)
 *
 * @example
 * ```typescript
 * const result = formatFileSize(1536000);
 * console.log(result); // '1.46 MB'
 * ```
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Formats a number using compact notation (K, M, B suffixes)
 *
 * @param num - The number to format
 * @returns A compact string representation
 *
 * @example
 * ```typescript
 * const result = formatCompactNumber(1500);
 * console.log(result); // '1.5K'
 * const result2 = formatCompactNumber(2500000);
 * console.log(result2); // '2.5M'
 * ```
 */
export function formatCompactNumber(num: number): string {
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
  if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`;
  return `${(num / 1000000000).toFixed(1)}B`;
}

/**
 * Formats a number with a fixed number of decimal places
 *
 * @param num - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns The formatted number string
 *
 * @example
 * ```typescript
 * const result = formatDecimal(3.14159, 3);
 * console.log(result); // '3.142'
 * ```
 */
export function formatDecimal(num: number, decimals: number = 2): string {
  return num.toFixed(decimals);
}

/**
 * Formats a number as an ordinal (1st, 2nd, 3rd, etc.)
 *
 * @param num - The number to format
 * @returns The formatted ordinal string
 *
 * @example
 * ```typescript
 * console.log(formatOrdinal(1)); // '1st'
 * console.log(formatOrdinal(22)); // '22nd'
 * console.log(formatOrdinal(103)); // '103rd'
 * ```
 */
export function formatOrdinal(num: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const value = num % 100;

  return num + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
}

/**
 * Parses a formatted number string back to a number
 *
 * @param str - The formatted number string (e.g., '$1,234.56')
 * @returns The parsed numeric value
 *
 * @example
 * ```typescript
 * const result = parseFormattedNumber('$1,234.56');
 * console.log(result); // 1234.56
 * ```
 */
export function parseFormattedNumber(str: string): number {
  return parseFloat(str.replace(/[^0-9.-]+/g, ""));
}

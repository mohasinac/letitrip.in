/**
 * Date Formatting Utilities
 *
 * Centralized date formatting functions
 */

/**
 * Formats a date to a locale-specific date string
 *
 * @param date - The date to format (Date object or ISO string)
 * @param locale - The locale for formatting (default: 'en-US')
 * @returns The formatted date string
 *
 * @example
 * ```typescript
 * const result = formatDate(new Date('2024-01-15'));
 * console.log(result); // '1/15/2024'
 * ```
 */
export function formatDate(
  date: Date | string,
  locale: string = "en-US",
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale);
}

/**
 * Formats a date with both date and time
 *
 * @param date - The date to format (Date object or ISO string)
 * @param locale - The locale for formatting (default: 'en-US')
 * @returns The formatted date and time string
 *
 * @example
 * ```typescript
 * const result = formatDateTime(new Date('2024-01-15T14:30:00'));
 * console.log(result); // '1/15/2024, 2:30:00 PM'
 * ```
 */
export function formatDateTime(
  date: Date | string,
  locale: string = "en-US",
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleString(locale);
}

/**
 * Formats time only without the date
 *
 * @param date - The date to extract time from (Date object or ISO string)
 * @param locale - The locale for formatting (default: 'en-US')
 * @returns The formatted time string
 *
 * @example
 * ```typescript
 * const result = formatTime(new Date('2024-01-15T14:30:00'));
 * console.log(result); // '2:30:00 PM'
 * ```
 */
export function formatTime(
  date: Date | string,
  locale: string = "en-US",
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleTimeString(locale);
}

/**
 * Formats a date as a relative time string (e.g., '2 hours ago')
 *
 * @param date - The date to compare with now (Date object or ISO string)
 * @returns A human-readable relative time string
 *
 * @example
 * ```typescript
 * const pastDate = new Date(Date.now() - 2 * 60 * 60 * 1000);
 * const result = formatRelativeTime(pastDate);
 * console.log(result); // '2 hours ago'
 * ```
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
  if (diffWeek < 4) return `${diffWeek} week${diffWeek > 1 ? "s" : ""} ago`;
  if (diffMonth < 12)
    return `${diffMonth} month${diffMonth > 1 ? "s" : ""} ago`;
  return `${diffYear} year${diffYear > 1 ? "s" : ""} ago`;
}

/**
 * Formats a date range with start and end dates
 *
 * @param startDate - The start date (Date object or ISO string)
 * @param endDate - The end date (Date object or ISO string)
 * @returns A formatted date range string
 *
 * @example
 * ```typescript
 * const result = formatDateRange('2024-01-15', '2024-01-20');
 * console.log(result); // '1/15/2024 - 1/20/2024'
 * ```
 */
export function formatDateRange(
  startDate: Date | string,
  endDate: Date | string,
): string {
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  return `${start} - ${end}`;
}

/**
 * Formats a date with custom formatting options
 *
 * @param date - The date to format (Date object or ISO string)
 * @param format - The format type: 'short', 'medium', 'long', or 'full' (default: 'medium')
 * @returns The formatted date string
 *
 * @example
 * ```typescript
 * const result = formatCustomDate(new Date('2024-01-15'), 'long');
 * console.log(result); // 'January 15, 2024'
 * ```
 */
export function formatCustomDate(
  date: Date | string,
  format: "short" | "medium" | "long" | "full" = "medium",
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
    short: { month: "numeric", day: "numeric", year: "2-digit" },
    medium: { month: "short", day: "numeric", year: "numeric" },
    long: { month: "long", day: "numeric", year: "numeric" },
    full: { weekday: "long", month: "long", day: "numeric", year: "numeric" },
  };

  const options = formatOptions[format] || formatOptions.medium;

  return dateObj.toLocaleDateString("en-US", options);
}

/**
 * Checks if a date is today
 *
 * @param date - The date to check (Date object or ISO string)
 * @returns True if the date is today
 *
 * @example
 * ```typescript
 * const today = new Date();
 * console.log(isToday(today)); // true
 * console.log(isToday('2020-01-01')); // false
 * ```
 */
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Checks if a date is in the past
 *
 * @param date - The date to check (Date object or ISO string)
 * @returns True if the date is before the current time
 *
 * @example
 * ```typescript
 * const yesterday = new Date(Date.now() - 86400000);
 * console.log(isPast(yesterday)); // true
 * ```
 */
export function isPast(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.getTime() < Date.now();
}

/**
 * Checks if a date is in the future
 *
 * @param date - The date to check (Date object or ISO string)
 * @returns True if the date is after the current time
 *
 * @example
 * ```typescript
 * const tomorrow = new Date(Date.now() + 86400000);
 * console.log(isFuture(tomorrow)); // true
 * ```
 */
export function isFuture(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.getTime() > Date.now();
}

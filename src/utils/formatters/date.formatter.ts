/**
 * Resolve any date-like value (Date, ISO string, number, or Firestore Timestamp JSON)
 * into a native Date object. Returns null for falsy or unparseable input.
 */
export function resolveDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "_seconds" in value &&
    typeof (value as Record<string, unknown>)._seconds === "number"
  ) {
    return new Date((value as { _seconds: number })._seconds * 1000);
  }
  const d = new Date(value as string | number);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Formats a date to a locale-specific date string
 *
 * @param date - The date to format (Date object or ISO string)
 * @param format - The format type: 'short', 'medium', 'long', or 'full' (default: 'medium')
 * @param locale - The locale for formatting (default: 'en-US')
 * @returns The formatted date string
 *
 * @example
 * ```typescript
 * const result = formatDate(new Date('2024-01-15'), 'medium');
 * console.log(result); // 'Jan 15, 2024'
 * ```
 */
export function formatDate(
  date: Date | string | number | unknown,
  format: "short" | "medium" | "long" | "full" = "medium",
  locale: string = "en-US",
): string {
  const dateObj = resolveDate(date);
  if (!dateObj) return "";

  const options: Intl.DateTimeFormatOptions = {};

  switch (format) {
    case "short":
      options.year = "2-digit";
      options.month = "numeric";
      options.day = "numeric";
      break;
    case "medium":
      options.year = "numeric";
      options.month = "short";
      options.day = "numeric";
      break;
    case "long":
      options.year = "numeric";
      options.month = "long";
      options.day = "numeric";
      break;
    case "full":
      options.year = "numeric";
      options.month = "long";
      options.day = "numeric";
      options.weekday = "long";
      break;
  }

  return dateObj.toLocaleDateString(locale, options);
}

/**
 * Formats a date with both date and time
 *
 * @param date - The date to format (Date object or ISO string)
 * @param format - The format type: 'short', 'medium', 'long', or 'full' (default: 'medium')
 * @param locale - The locale for formatting (default: 'en-US')
 * @returns The formatted date and time string
 *
 * @example
 * ```typescript
 * const result = formatDateTime(new Date('2024-01-15T14:30:00'), 'medium');
 * console.log(result); // 'Jan 15, 2024, 2:30 PM'
 * ```
 */
export function formatDateTime(
  date: Date | string | number | unknown,
  format: "short" | "medium" | "long" | "full" = "medium",
  locale: string = "en-US",
): string {
  const dateObj = resolveDate(date);
  if (!dateObj) return "";

  const dateOptions: Intl.DateTimeFormatOptions = {};
  const timeOptions: Intl.DateTimeFormatOptions = {};

  switch (format) {
    case "short":
      dateOptions.year = "2-digit";
      dateOptions.month = "2-digit";
      dateOptions.day = "2-digit";
      timeOptions.hour = "2-digit";
      timeOptions.minute = "2-digit";
      break;
    case "medium":
      dateOptions.year = "numeric";
      dateOptions.month = "short";
      dateOptions.day = "numeric";
      timeOptions.hour = "2-digit";
      timeOptions.minute = "2-digit";
      break;
    case "long":
      dateOptions.year = "numeric";
      dateOptions.month = "long";
      dateOptions.day = "numeric";
      timeOptions.hour = "2-digit";
      timeOptions.minute = "2-digit";
      timeOptions.second = "2-digit";
      break;
    case "full":
      dateOptions.year = "numeric";
      dateOptions.month = "long";
      dateOptions.day = "numeric";
      dateOptions.weekday = "long";
      timeOptions.hour = "2-digit";
      timeOptions.minute = "2-digit";
      timeOptions.second = "2-digit";
      break;
  }

  const datePart = dateObj.toLocaleDateString(locale, dateOptions);
  const timePart = dateObj.toLocaleTimeString(locale, timeOptions);
  return `${datePart}, ${timePart}`;
}

/**
 * Formats time only without the date
 *
 * @param date - The date to extract time from (Date object or ISO string)
 * @param format - The format type: 'short' or 'long' (default: 'long')
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
  format: "short" | "long" = "long",
  locale: string = "en-US",
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions =
    format === "short"
      ? { hour: "2-digit", minute: "2-digit" }
      : { hour: "2-digit", minute: "2-digit", second: "2-digit" };

  return dateObj.toLocaleTimeString(locale, options);
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
/**
 * Formats a date as "Month Year" (e.g., "January 2024")
 *
 * @param date - The date to format (Date object or ISO string)
 * @param locale - The locale for formatting (default: 'en-US')
 * @returns The formatted month and year string
 *
 * @example
 * ```typescript
 * const result = formatMonthYear(new Date('2024-01-15'));
 * console.log(result); // 'January 2024'
 * ```
 */
export function formatMonthYear(
  date: Date | string,
  locale: string = "en-US",
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale, { month: "long", year: "numeric" });
}

export function formatDateRange(
  startDate: Date | string,
  endDate: Date | string,
  locale: string = "en-US",
): string {
  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;

  const startFormatted = start.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: start.getFullYear() !== end.getFullYear() ? "numeric" : undefined,
  });

  const endFormatted = end.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startFormatted} - ${endFormatted}`;
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

/**
 * Returns the current UTC epoch in milliseconds.
 *
 * @returns Current timestamp in ms (equivalent to Date.now())
 *
 * @example
 * ```typescript
 * const ts = nowMs(); // e.g. 1740000000000
 * ```
 */
export function nowMs(): number {
  return Date.now();
}

/**
 * Checks whether two dates fall in the same calendar month and year.
 *
 * @param a - First date (Date object or numeric timestamp)
 * @param b - Second date (Date object or numeric timestamp)
 * @returns True when both dates share the same month and year
 *
 * @example
 * ```typescript
 * isSameMonth(new Date('2026-03-01'), new Date('2026-03-31')); // true
 * isSameMonth(new Date('2026-03-01'), new Date('2026-04-01')); // false
 * ```
 */
export function isSameMonth(a: Date | number, b: Date | number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth()
  );
}

/**
 * Returns the current four-digit year as a string.
 *
 * @returns Current year, e.g. "2026"
 *
 * @example
 * ```typescript
 * currentYear(); // '2026'
 * ```
 */
export function currentYear(): string {
  return new Date(nowMs()).getFullYear().toString();
}

/**
 * Returns the current instant as an ISO 8601 string.
 *
 * @returns ISO 8601 timestamp string, e.g. "2026-03-01T12:00:00.000Z"
 *
 * @example
 * ```typescript
 * nowISO(); // '2026-03-01T12:00:00.000Z'
 * ```
 */
export function nowISO(): string {
  return new Date(nowMs()).toISOString();
}

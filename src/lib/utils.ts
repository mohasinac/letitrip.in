/**
 * Utility Functions
 *
 * Common helper functions used throughout the application.
 * Includes formatting, validation, string manipulation, and more.
 *
 * @example
 * ```tsx
 * import { cn, formatPrice, formatDate, slugify } from '@/lib/utils';
 *
 * const className = cn('base-class', isActive && 'active-class');
 * const price = formatPrice(1234.56); // "₹1,234.56"
 * const date = formatDate(new Date()); // "Jan 19, 2026"
 * ```
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with conflict resolution
 * Combines clsx and tailwind-merge for optimal class merging
 *
 * @param inputs - Class values to merge
 * @returns Merged class string
 *
 * @example
 * ```tsx
 * cn('px-4 py-2', 'px-6') // 'py-2 px-6'
 * cn('text-red-500', isError && 'text-red-700') // 'text-red-700' if isError
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price in Indian Rupees
 *
 * @param amount - Price amount
 * @param currency - Currency code (default: 'INR')
 * @returns Formatted price string
 *
 * @example
 * ```tsx
 * formatPrice(1234.56) // "₹1,234.56"
 * formatPrice(1000) // "₹1,000.00"
 * ```
 */
export function formatPrice(amount: number, currency: string = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format number with Indian numbering system
 *
 * @param num - Number to format
 * @returns Formatted number string
 *
 * @example
 * ```tsx
 * formatNumber(1234567) // "12,34,567"
 * ```
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-IN").format(num);
}

/**
 * Format date to readable string
 *
 * @param date - Date to format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 *
 * @example
 * ```tsx
 * formatDate(new Date()) // "Jan 19, 2026"
 * formatDate(new Date(), { dateStyle: 'full' }) // "Monday, January 19, 2026"
 * ```
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", options).format(dateObj);
}

/**
 * Format date with time
 *
 * @param date - Date to format
 * @returns Formatted date and time string
 *
 * @example
 * ```tsx
 * formatDateTime(new Date()) // "Jan 19, 2026, 3:45 PM"
 * ```
 */
export function formatDateTime(date: Date | string): string {
  return formatDate(date, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/**
 * Get relative time string (e.g., "2 hours ago")
 *
 * @param date - Date to compare
 * @returns Relative time string
 *
 * @example
 * ```tsx
 * getRelativeTime(new Date(Date.now() - 3600000)) // "1 hour ago"
 * ```
 */
export function getRelativeTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000)
    return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

/**
 * Get time remaining until a date
 *
 * @param endTime - End date
 * @returns Object with totalMs and isEnded flag
 *
 * @example
 * ```tsx
 * getTimeRemaining(new Date(Date.now() + 3600000)) // { totalMs: 3600000, isEnded: false }
 * ```
 */
export function getTimeRemaining(endTime: Date | null): {
  totalMs: number;
  isEnded: boolean;
} {
  if (!endTime) return { totalMs: 0, isEnded: true };

  const now = new Date().getTime();
  const end = endTime.getTime();
  const totalMs = end - now;

  return {
    totalMs: Math.max(0, totalMs),
    isEnded: totalMs <= 0,
  };
}

/**
 * Format time remaining in readable format
 *
 * @param endTime - End date
 * @returns Formatted time remaining string
 *
 * @example
 * ```tsx
 * formatTimeRemaining(new Date(Date.now() + 3600000)) // "1h left"
 * formatTimeRemaining(new Date(Date.now() - 1000)) // "Ended"
 * ```
 */
export function formatTimeRemaining(endTime: Date | null): string {
  const { totalMs, isEnded } = getTimeRemaining(endTime);

  if (isEnded) return "Ended";

  const seconds = Math.floor(totalMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d left`;
  if (hours > 0) return `${hours}h left`;
  if (minutes > 0) return `${minutes}m left`;
  return `${seconds}s left`;
}

/**
 * Convert string to URL-friendly slug
 *
 * @param str - String to slugify
 * @returns Slugified string
 *
 * @example
 * ```tsx
 * slugify('Hello World!') // 'hello-world'
 * slugify('Product Name 123') // 'product-name-123'
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
 * Truncate string to specified length
 *
 * @param str - String to truncate
 * @param length - Maximum length
 * @param suffix - Suffix to add (default: '...')
 * @returns Truncated string
 *
 * @example
 * ```tsx
 * truncate('Long text here', 10) // 'Long text...'
 * ```
 */
export function truncate(
  str: string,
  length: number,
  suffix: string = "...",
): string {
  if (str.length <= length) return str;
  return str.slice(0, length - suffix.length) + suffix;
}

/**
 * Capitalize first letter of string
 *
 * @param str - String to capitalize
 * @returns Capitalized string
 *
 * @example
 * ```tsx
 * capitalize('hello world') // 'Hello world'
 * ```
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Validate email format
 *
 * @param email - Email to validate
 * @returns True if valid
 *
 * @example
 * ```tsx
 * isValidEmail('test@example.com') // true
 * isValidEmail('invalid-email') // false
 * ```
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Indian phone number
 *
 * @param phone - Phone number to validate
 * @returns True if valid
 *
 * @example
 * ```tsx
 * isValidPhone('9876543210') // true
 * isValidPhone('+919876543210') // true
 * ```
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

/**
 * Format phone number to Indian format
 *
 * @param phone - Phone number to format
 * @returns Formatted phone number
 *
 * @example
 * ```tsx
 * formatPhone('9876543210') // '+91 98765 43210'
 * ```
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
}

/**
 * Generate random ID
 *
 * @param length - Length of ID (default: 16)
 * @returns Random ID string
 *
 * @example
 * ```tsx
 * generateId() // 'a1b2c3d4e5f6g7h8'
 * generateId(8) // 'a1b2c3d4'
 * ```
 */
export function generateId(length: number = 16): string {
  return Array.from({ length }, () =>
    Math.floor(Math.random() * 36).toString(36),
  ).join("");
}

/**
 * Debounce function calls
 *
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 *
 * @example
 * ```tsx
 * const debouncedSearch = debounce(handleSearch, 300);
 * ```
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Calculate percentage
 *
 * @param value - Current value
 * @param total - Total value
 * @param decimals - Number of decimal places
 * @returns Percentage
 *
 * @example
 * ```tsx
 * calculatePercentage(25, 100) // 25
 * calculatePercentage(1, 3, 2) // 33.33
 * ```
 */
export function calculatePercentage(
  value: number,
  total: number,
  decimals: number = 0,
): number {
  if (total === 0) return 0;
  return Number(((value / total) * 100).toFixed(decimals));
}

/**
 * Calculate discount percentage
 *
 * @param originalPrice - Original price
 * @param discountedPrice - Discounted price
 * @returns Discount percentage
 *
 * @example
 * ```tsx
 * calculateDiscount(1000, 800) // 20
 * ```
 */
export function calculateDiscount(
  originalPrice: number,
  discountedPrice: number,
): number {
  return calculatePercentage(originalPrice - discountedPrice, originalPrice);
}

/**
 * Sleep utility for async functions
 *
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after delay
 *
 * @example
 * ```tsx
 * await sleep(1000); // Wait 1 second
 * ```
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 *
 * @param value - Value to check
 * @returns True if empty
 *
 * @example
 * ```tsx
 * isEmpty('') // true
 * isEmpty([]) // true
 * isEmpty({}) // true
 * isEmpty('text') // false
 * ```
 */
export function isEmpty(value: any): boolean {
  if (value == null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

/**
 * Deep clone object
 *
 * @param obj - Object to clone
 * @returns Cloned object
 *
 * @example
 * ```tsx
 * const cloned = deepClone(original);
 * ```
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Group array by key
 *
 * @param array - Array to group
 * @param key - Key to group by
 * @returns Grouped object
 *
 * @example
 * ```tsx
 * groupBy([{id: 1, type: 'a'}, {id: 2, type: 'a'}], 'type')
 * // { a: [{id: 1, type: 'a'}, {id: 2, type: 'a'}] }
 * ```
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((acc, item) => {
    const groupKey = String(item[key]);
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

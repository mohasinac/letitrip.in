/**
 * @fileoverview ID and String Formatting Helpers
 * @module src/lib/id-helpers
 * @description Utilities for formatting IDs, truncating text, and string manipulation
 *
 * @created 2025-12-06
 * @pattern Helper Utility
 */

/**
 * Shorten UUID/ID to first 8 characters for display
 * @example shortId("550e8400-e29b-41d4-a716-446655440000") => "550e8400"
 */
export function shortId(id: string, length: number = 8): string {
  return id.slice(0, length).toUpperCase();
}

/**
 * Format order ID with # prefix
 * @example formatOrderId("550e8400-e29b-41d4-a716") => "#550E8400"
 */
export function formatOrderId(id: string): string {
  return `#${shortId(id)}`;
}

/**
 * Format ticket ID with # prefix
 * @example formatTicketId("550e8400-e29b-41d4-a716") => "#550E8400"
 */
export function formatTicketId(id: string): string {
  return `#${shortId(id)}`;
}

/**
 * Format return/refund ID with # prefix
 * @example formatReturnId("550e8400-e29b-41d4-a716") => "#550E8400"
 */
export function formatReturnId(id: string): string {
  return `#${shortId(id)}`;
}

/**
 * Truncate text with ellipsis
 * @example truncate("Hello World", 5) => "Hello..."
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Truncate text at word boundary
 * @example truncateWords("Hello world from TypeScript", 2) => "Hello world..."
 */
export function truncateWords(text: string, maxWords: number): string {
  const words = text.split(" ");
  if (words.length <= maxWords) return text;
  return `${words.slice(0, maxWords).join(" ")}...`;
}

/**
 * Pluralize word based on count
 * @example pluralize(1, "item") => "item"
 * @example pluralize(5, "item") => "items"
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string
): string {
  if (count === 1) return singular;
  return plural || `${singular}s`;
}

/**
 * Format count with pluralized word
 * @example formatCount(5, "item") => "5 items"
 * @example formatCount(1, "review") => "1 review"
 */
export function formatCount(
  count: number,
  singular: string,
  plural?: string
): string {
  return `${count} ${pluralize(count, singular, plural)}`;
}

/**
 * Convert string to title case
 * @example toTitleCase("hello world") => "Hello World"
 */
export function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Convert string to slug (URL-friendly)
 * @example toSlug("Hello World! 123") => "hello-world-123"
 */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Remove consecutive hyphens
    .trim();
}

/**
 * Generate initials from name
 * @example getInitials("John Doe") => "JD"
 * @example getInitials("Alice") => "A"
 */
export function getInitials(name: string): string {
  const words = name.trim().split(" ");
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

/**
 * Mask sensitive data (email, phone, etc.)
 * @example maskEmail("john@example.com") => "j***@example.com"
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  const maskedLocal = local.charAt(0) + "***";
  return `${maskedLocal}@${domain}`;
}

/**
 * Mask phone number
 * @example maskPhone("1234567890") => "******7890"
 */
export function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  return "*".repeat(Math.max(0, cleaned.length - 4)) + cleaned.slice(-4);
}

/**
 * Format file size in bytes to human readable
 * @example formatFileSize(1024) => "1 KB"
 * @example formatFileSize(1536) => "1.5 KB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Extract domain from URL or email
 * @example extractDomain("https://www.example.com/path") => "example.com"
 * @example extractDomain("user@example.com") => "example.com"
 */
export function extractDomain(input: string): string {
  if (input.includes("@")) {
    return input.split("@")[1];
  }

  try {
    const url = new URL(input.startsWith("http") ? input : `https://${input}`);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return input;
  }
}

/**
 * Highlight search term in text
 * @example highlightSearch("Hello World", "wor") => "Hello <mark>Wor</mark>ld"
 */
export function highlightSearch(text: string, searchTerm: string): string {
  if (!searchTerm) return text;

  const regex = new RegExp(`(${searchTerm})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

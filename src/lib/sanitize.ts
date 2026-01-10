/**
 * Input Sanitization Utilities
 *
 * Provides functions to sanitize user input to prevent XSS attacks and other
 * security vulnerabilities. Uses DOMPurify for HTML sanitization.
 *
 * @module lib/sanitize
 */

import DOMPurify from "isomorphic-dompurify";

/**
 * Configuration for HTML sanitization
 */
export interface SanitizeHtmlOptions {
  /**
   * Allow specific HTML tags (whitelist)
   * @default []
   */
  allowedTags?: string[];

  /**
   * Allow specific HTML attributes (whitelist)
   * @default []
   */
  allowedAttributes?: string[];

  /**
   * Allow all safe tags and attributes
   * @default false
   */
  allowBasicFormatting?: boolean;

  /**
   * Allow links (a tags with href)
   * @default false
   */
  allowLinks?: boolean;

  /**
   * Allow images (img tags with src, alt)
   * @default false
   */
  allowImages?: boolean;

  /**
   * Strip all HTML tags, leaving only text
   * @default false
   */
  stripAll?: boolean;
}

/**
 * Default allowed tags for basic text formatting
 */
const BASIC_FORMATTING_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "blockquote",
  "code",
  "pre",
];

/**
 * Default allowed attributes for basic formatting
 */
const BASIC_FORMATTING_ATTRS = ["class", "id"];

/**
 * Allowed attributes for links
 */
const LINK_ATTRS = ["href", "title", "rel", "target"];

/**
 * Allowed attributes for images
 */
const IMAGE_ATTRS = ["src", "alt", "title", "width", "height"];

/**
 * Sanitize HTML content to prevent XSS attacks
 *
 * @example
 * ```typescript
 * // Strip all HTML
 * const clean = sanitizeHtml('<script>alert("xss")</script>Hello');
 * // Result: 'Hello'
 *
 * // Allow basic formatting
 * const formatted = sanitizeHtml('<p>Hello <strong>World</strong></p>', {
 *   allowBasicFormatting: true
 * });
 * // Result: '<p>Hello <strong>World</strong></p>'
 *
 * // Allow links
 * const withLinks = sanitizeHtml('<a href="http://example.com">Link</a>', {
 *   allowLinks: true
 * });
 * // Result: '<a href="http://example.com">Link</a>'
 * ```
 */
export function sanitizeHtml(
  input: string | null | undefined,
  options: SanitizeHtmlOptions = {}
): string {
  if (!input) return "";

  const {
    allowedTags = [],
    allowedAttributes = [],
    allowBasicFormatting = false,
    allowLinks = false,
    allowImages = false,
    stripAll = false,
  } = options;

  // If stripAll is true, remove all HTML tags
  if (stripAll) {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    });
  }

  // Build the allowed tags list
  const tags = new Set<string>(allowedTags);

  if (allowBasicFormatting) {
    BASIC_FORMATTING_TAGS.forEach((tag) => tags.add(tag));
  }

  if (allowLinks) {
    tags.add("a");
  }

  if (allowImages) {
    tags.add("img");
  }

  // Build the allowed attributes list
  const attrs = new Set<string>(allowedAttributes);

  if (allowBasicFormatting) {
    BASIC_FORMATTING_ATTRS.forEach((attr) => attrs.add(attr));
  }

  if (allowLinks) {
    LINK_ATTRS.forEach((attr) => attrs.add(attr));
  }

  if (allowImages) {
    IMAGE_ATTRS.forEach((attr) => attrs.add(attr));
  }

  // Sanitize with DOMPurify
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: Array.from(tags),
    ALLOWED_ATTR: Array.from(attrs),
    KEEP_CONTENT: true,
  });
}

/**
 * Sanitize plain text input by removing potentially dangerous characters
 * and normalizing whitespace
 *
 * @example
 * ```typescript
 * const clean = sanitizeString('<script>alert("xss")</script>');
 * // Result: 'alert("xss")'
 *
 * const normalized = sanitizeString('  Hello   World  ');
 * // Result: 'Hello World'
 * ```
 */
export function sanitizeString(
  input: string | null | undefined,
  options: {
    /**
     * Trim whitespace from start and end
     * @default true
     */
    trim?: boolean;

    /**
     * Collapse multiple spaces into one
     * @default true
     */
    collapseWhitespace?: boolean;

    /**
     * Remove all HTML tags
     * @default true
     */
    stripHtml?: boolean;

    /**
     * Convert to lowercase
     * @default false
     */
    lowercase?: boolean;

    /**
     * Maximum length (truncate if longer)
     * @default undefined
     */
    maxLength?: number;
  } = {}
): string {
  if (!input) return "";

  const {
    trim = true,
    collapseWhitespace = true,
    stripHtml = true,
    lowercase = false,
    maxLength,
  } = options;

  let result = input;

  // Strip HTML tags
  if (stripHtml) {
    result = result.replace(/<[^>]*>/g, "");
  }

  // Decode HTML entities
  result = result
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&");

  // Collapse whitespace
  if (collapseWhitespace) {
    result = result.replace(/\s+/g, " ");
  }

  // Trim
  if (trim) {
    result = result.trim();
  }

  // Convert to lowercase
  if (lowercase) {
    result = result.toLowerCase();
  }

  // Truncate to max length
  if (maxLength && result.length > maxLength) {
    result = result.substring(0, maxLength);
  }

  return result;
}

/**
 * Sanitize email address
 * Removes dangerous characters and validates basic format
 */
export function sanitizeEmail(email: string | null | undefined): string {
  if (!email) return "";

  // Remove whitespace and convert to lowercase
  let sanitized = sanitizeString(email, {
    trim: true,
    collapseWhitespace: true,
    stripHtml: true,
    lowercase: true,
  });

  // Remove any characters that aren't valid in email addresses
  sanitized = sanitized.replace(/[^a-z0-9@._+-]/g, "");

  return sanitized;
}

/**
 * Sanitize phone number
 * Removes non-numeric characters except + and spaces
 */
export function sanitizePhone(phone: string | null | undefined): string {
  if (!phone) return "";

  // Remove HTML and trim
  let sanitized = sanitizeString(phone, {
    trim: true,
    stripHtml: true,
  });

  // Keep only digits, +, -, spaces, and parentheses
  sanitized = sanitized.replace(/[^0-9+\-\s()]/g, "");

  return sanitized;
}

/**
 * Sanitize URL
 * Validates protocol and removes dangerous characters
 */
export function sanitizeUrl(
  url: string | null | undefined,
  options: {
    /**
     * Allowed protocols
     * @default ['http', 'https']
     */
    allowedProtocols?: string[];

    /**
     * Require protocol
     * @default true
     */
    requireProtocol?: boolean;
  } = {}
): string {
  if (!url) return "";

  const { allowedProtocols = ["http", "https"], requireProtocol = true } =
    options;

  // Remove HTML and trim
  let sanitized = sanitizeString(url, {
    trim: true,
    stripHtml: true,
  });

  // Check for javascript: protocol and other dangerous protocols
  const dangerousProtocols = ["javascript:", "data:", "vbscript:", "file:"];
  for (const protocol of dangerousProtocols) {
    if (sanitized.toLowerCase().startsWith(protocol)) {
      return "";
    }
  }

  // Validate allowed protocols
  if (requireProtocol) {
    const hasValidProtocol = allowedProtocols.some((protocol) =>
      sanitized.toLowerCase().startsWith(`${protocol}://`)
    );

    if (!hasValidProtocol) {
      return "";
    }
  }

  return sanitized;
}

/**
 * Sanitize filename
 * Removes path traversal characters and dangerous filename characters
 */
export function sanitizeFilename(filename: string | null | undefined): string {
  if (!filename) return "";

  // Remove HTML and trim
  let sanitized = sanitizeString(filename, {
    trim: true,
    stripHtml: true,
  });

  // Remove path traversal patterns
  sanitized = sanitized.replace(/\.\./g, "");
  sanitized = sanitized.replace(/[/\\]/g, "");

  // Remove dangerous characters
  sanitized = sanitized.replace(/[<>:"|?*\x00-\x1f]/g, "");

  // Limit length
  if (sanitized.length > 255) {
    sanitized = sanitized.substring(0, 255);
  }

  return sanitized;
}

/**
 * Sanitize search query
 * Removes dangerous characters while preserving search functionality
 */
export function sanitizeSearchQuery(query: string | null | undefined): string {
  if (!query) return "";

  // Remove HTML and normalize whitespace
  let sanitized = sanitizeString(query, {
    trim: true,
    collapseWhitespace: true,
    stripHtml: true,
    maxLength: 200,
  });

  // Remove special characters that could be used for injection
  sanitized = sanitized.replace(/[<>{}[\]\\]/g, "");

  return sanitized;
}

/**
 * Sanitize JSON input
 * Attempts to parse JSON and returns sanitized object or null
 */
export function sanitizeJson<T = unknown>(
  input: string | null | undefined
): T | null {
  if (!input) return null;

  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}

/**
 * Batch sanitize an object's string properties
 * Recursively sanitizes all string values in an object
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  options: {
    /**
     * Fields to sanitize as HTML
     */
    htmlFields?: string[];

    /**
     * Fields to sanitize as email
     */
    emailFields?: string[];

    /**
     * Fields to sanitize as phone
     */
    phoneFields?: string[];

    /**
     * Fields to sanitize as URL
     */
    urlFields?: string[];

    /**
     * HTML sanitization options
     */
    htmlOptions?: SanitizeHtmlOptions;
  } = {}
): T {
  const {
    htmlFields = [],
    emailFields = [],
    phoneFields = [],
    urlFields = [],
    htmlOptions = {},
  } = options;

  const result: any = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    const value = obj[key];

    if (value === null || value === undefined) {
      result[key] = value;
    } else if (typeof value === "string") {
      // Apply specific sanitization based on field type
      if (htmlFields.includes(key)) {
        result[key] = sanitizeHtml(value, htmlOptions);
      } else if (emailFields.includes(key)) {
        result[key] = sanitizeEmail(value);
      } else if (phoneFields.includes(key)) {
        result[key] = sanitizePhone(value);
      } else if (urlFields.includes(key)) {
        result[key] = sanitizeUrl(value);
      } else {
        result[key] = sanitizeString(value);
      }
    } else if (typeof value === "object") {
      // Recursively sanitize nested objects
      result[key] = sanitizeObject(value, options);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}

/**
 * Pre-configured sanitizers for common use cases
 */
export const Sanitizers = {
  /**
   * For user profile names (no HTML, max 100 chars)
   */
  userName: (input: string | null | undefined) =>
    sanitizeString(input, { maxLength: 100 }),

  /**
   * For product/blog titles (no HTML, max 200 chars)
   */
  title: (input: string | null | undefined) =>
    sanitizeString(input, { maxLength: 200 }),

  /**
   * For descriptions with basic formatting
   */
  description: (input: string | null | undefined) =>
    sanitizeHtml(input, { allowBasicFormatting: true }),

  /**
   * For rich content with links and images
   */
  richContent: (input: string | null | undefined) =>
    sanitizeHtml(input, {
      allowBasicFormatting: true,
      allowLinks: true,
      allowImages: true,
    }),

  /**
   * For plain text comments (no HTML)
   */
  comment: (input: string | null | undefined) =>
    sanitizeString(input, { maxLength: 5000 }),
};

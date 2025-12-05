/**
 * @fileoverview TypeScript Module
 * @module src/lib/formatters
 * @description This file contains functionality related to formatters
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Formatting Utilities
 *
 * Provides consistent formatting for currency, dates, numbers, etc.
 * Used throughout the application for display purposes
 */

/**
 * Format compact currency (1K, 1L, 1Cr for Indian numbering)
 */
/**
 * Formats compact currency
 *
 * @param {number} amount - The amount
 *
 * @returns {string} The formatcompactcurrency result
 *
 * @example
 * formatCompactCurrency(123);
 */

/**
 * Formats compact currency
 *
 * @param {number} amount - The amount
 *
 * @returns {string} The formatcompactcurrency result
 *
 * @example
 * formatCompactCurrency(123);
 */

export function formatCompactCurrency(amount: number): string {
  if (amount >= 10000000) {
    // 1 Crore or more
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) {
    // 1 Lakh or more
    return `₹${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) {
    // 1 Thousand or more
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

/**
 * Format date to localized string
 */
/**
 * Formats date
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * formatDate();
 */

/**
 * Formats date
 *
 * @returns {any} The formatdate result
 *
 * @example
 * formatDate();
 */

export function formatDate(
  /** Date */
  date: Date | string | number | null | undefined,
  /** Options */
  options: {
    /** Format */
    format?: "short" | "medium" | "long" | "full";
    /** Include Time */
    includeTime?: boolean;
    /** Locale */
    locale?: string;
    /** Fallback */
    fallback?: string;
  } = {}
): string {
  const {
    format = "medium",
    includeTime = false,
    locale = "en-IN",
    fallback = "N/A",
  } = options;

  // Handle null/undefined
  if (date == null) {
    return fallback;
  }

  const dateObj =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;

  // Validate date is finite (handles Invalid Date / NaN)
  if (!dateObj || !isFinite(dateObj.getTime())) {
    return fallback;
  }

  const dateFormatOptions: Intl.DateTimeFormatOptions = {
    /** Date Style */
    dateStyle: format,
  };

  if (includeTime) {
    dateFormatOptions.timeStyle = format === "short" ? "short" : "medium";
  }

  return new Intl.DateTimeFormat(locale, dateFormatOptions).format(dateObj);
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
/**
 * Formats relative time
 *
 * @returns {string} The formatrelativetime result
 *
 * @example
 * formatRelativeTime();
 */

/**
 * Formats relative time
 *
 * @returns {any} The formatrelativetime result
 *
 * @example
 * formatRelativeTime();
 */

export function formatRelativeTime(
  /** Date */
  date: Date | string | number,
  /** Options */
  options: {
    /** Locale */
    locale?: string;
    /** Style */
    style?: "long" | "short" | "narrow";
  } = {}
): string {
  const { locale = "en-IN", style = "long" } = options;

  const dateObj =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto", style });

  const intervals: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1],
  ];

  for (const [unit, secondsInUnit] of intervals) {
    const diff = Math.floor(diffInSeconds / secondsInUnit);
    if (Math.abs(diff) >= 1) {
      return rtf.format(-diff, unit);
    }
  }

  return rtf.format(0, "second");
}

/**
 * Format number with Indian numbering system
 */
/**
 * Formats number
 *
 * @returns {string} The formatnumber result
 *
 * @example
 * formatNumber();
 */

/**
 * Formats number
 *
 * @returns {number} The formatnumber result
 *
 * @example
 * formatNumber();
 */

export function formatNumber(
  /** Num */
  num: number,
  /** Options */
  options: {
    /** Locale */
    locale?: string;
    /** Minimum Fraction Digits */
    minimumFractionDigits?: number;
    /** Maximum Fraction Digits */
    maximumFractionDigits?: number;
  } = {}
): string {
  const {
    locale = "en-IN",
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
  } = options;

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(num);
}

/**
 * Format compact number (1K, 1M, 1B)
 */
/**
 * Formats compact number
 *
 * @param {number} num - The num
 * @param {string} [locale] - The locale
 *
 * @returns {string} The formatcompactnumber result
 *
 * @example
 * formatCompactNumber(123, "example");
 */

/**
 * Formats compact number
 *
 * @returns {string} The formatcompactnumber result
 *
 * @example
 * formatCompactNumber();
 */

export function formatCompactNumber(
  /** Num */
  num: number,
  /** Locale */
  locale: string = "en-IN"
): string {
  return new Intl.NumberFormat(locale, {
    /** Notation */
    notation: "compact",
    /** Compact Display */
    compactDisplay: "short",
  }).format(num);
}

/**
 * Format percentage
 */
/**
 * Formats percentage
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * formatPercentage();
 */

/**
 * Formats percentage
 *
 * @returns {number} The formatpercentage result
 *
 * @example
 * formatPercentage();
 */

export function formatPercentage(
  /** Value */
  value: number,
  /** Options */
  options: {
    /** Decimals */
    decimals?: number;
    /** Show Sign */
    showSign?: boolean;
  } = {}
): string {
  const { decimals = 0, showSign = false } = options;
  const sign = showSign && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format phone number (Indian format)
 */
/**
 * Formats phone number
 *
 * @param {string} phone - The phone
 *
 * @returns {string} The formatphonenumber result
 *
 * @example
 * formatPhoneNumber("example");
 */

/**
 * Formats phone number
 *
 * @param {string} phone - The phone
 *
 * @returns {string} The formatphonenumber result
 *
 * @example
 * formatPhoneNumber("example");
 */

export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");

  // Indian mobile number format: +91 XXXXX XXXXX
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  } else if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }

  return phone;
}

/**
 * Format pincode (6 digits)
 */
/**
 * Formats pincode
 *
 * @param {string} pincode - The pincode
 *
 * @returns {string} The formatpincode result
 *
 * @example
 * formatPincode("example");
 */

/**
 * Formats pincode
 *
 * @param {string} pincode - The pincode
 *
 * @returns {string} The formatpincode result
 *
 * @example
 * formatPincode("example");
 */

export function formatPincode(pincode: string): string {
  const cleaned = pincode.replace(/\D/g, "");
  return cleaned.slice(0, 6);
}

/**
 * Format file size
 */
/**
 * Formats file size
 *
 * @param {number} bytes - The bytes
 *
 * @returns {string} The formatfilesize result
 *
 * @example
 * formatFileSize(123);
 */

/**
 * Formats file size
 *
 * @param {number} bytes - The bytes
 *
 * @returns {string} The formatfilesize result
 *
 * @example
 * formatFileSize(123);
 */

export function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

/**
 * Format duration (seconds to human readable)
 */
/**
 * Formats duration
 *
 * @param {number} seconds - The seconds
 *
 * @returns {string} The formatduration result
 *
 * @example
 * formatDuration(123);
 */

/**
 * Formats duration
 *
 * @param {number} seconds - The seconds
 *
 * @returns {string} The formatduration result
 *
 * @example
 * formatDuration(123);
 */

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(" ");
}

/**
 * Format order ID (e.g., #ORD-12345)
 */
/**
 * Formats order id
 *
 * @param {string} id - Unique identifier
 *
 * @returns {string} The formatorderid result
 *
 * @example
 * formatOrderId("example");
 */

/**
 * Formats order id
 *
 * @param {string} id - Unique identifier
 *
 * @returns {string} The formatorderid result
 *
 * @example
 * formatOrderId("example");
 */

export function formatOrderId(id: string): string {
  return `#ORD-${id.slice(-8).toUpperCase()}`;
}

/**
 * Format shop ID (e.g., SHP-12345)
 */
/**
 * Formats shop id
 *
 * @param {string} id - Unique identifier
 *
 * @returns {string} The formatshopid result
 *
 * @example
 * formatShopId("example");
 */

/**
 * Formats shop id
 *
 * @param {string} id - Unique identifier
 *
 * @returns {string} The formatshopid result
 *
 * @example
 * formatShopId("example");
 */

export function formatShopId(id: string): string {
  return `SHP-${id.slice(-8).toUpperCase()}`;
}

/**
 * Format product SKU
 */
/**
 * Formats s k u
 *
 * @param {string} sku - The sku
 *
 * @returns {string} The formatsku result
 *
 * @example
 * formatSKU("example");
 */

/**
 * Formats s k u
 *
 * @param {string} sku - The sku
 *
 * @returns {string} The formatsku result
 *
 * @example
 * formatSKU("example");
 */

export function formatSKU(sku: string): string {
  return sku.toUpperCase();
}

/**
 * Truncate text with ellipsis
 */
/**
 * Performs truncate text operation
 *
 * @param {string} text - The text
 * @param {number} maxLength - The max length
 *
 * @returns {string} The truncatetext result
 *
 * @example
 * truncateText("example", 123);
 */

/**
 * Performs truncate text operation
 *
 * @param {string} text - The text
 * @param {number} maxLength - The max length
 *
 * @returns {string} The truncatetext result
 *
 * @example
 * truncateText("example", 123);
 */

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Format slug to title
 */
/**
 * Performs slug to title operation
 *
 * @param {string} slug - URL-friendly identifier
 *
 * @returns {string} The slugtotitle result
 *
 * @example
 * slugToTitle("example");
 */

/**
 * Performs slug to title operation
 *
 * @param {string} slug - URL-friendly identifier
 *
 * @returns {string} The slugtotitle result
 *
 * @example
 * slugToTitle("example");
 */

export function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Format discount percentage
 */
/**
 * Formats discount
 *
 * @param {number} originalPrice - The original price
 * @param {number} currentPrice - The current price
 *
 * @returns {string} The formatdiscount result
 *
 * @example
 * formatDiscount(123, 123);
 */

/**
 * Formats discount
 *
 * @returns {number} The formatdiscount result
 *
 * @example
 * formatDiscount();
 */

export function formatDiscount(
  /** Original Price */
  originalPrice: number,
  /** Current Price */
  currentPrice: number
): string {
  if (originalPrice <= currentPrice) return "0%";
  /**
   * Performs discount operation
   *
   * @returns {any} The discount result
   */

  /**
   * Performs discount operation
   *
   * @returns {any} The discount result
   */

  const discount = ((originalPrice - currentPrice) / originalPrice) * 100;
  return formatPercentage(discount, { decimals: 0 });
}

/**
 * Format rating (e.g., "4.5 out of 5")
 */
/**
 * Formats rating
 *
 * @param {number} rating - The rating
 * @param {number} [maxRating] - The max rating
 *
 * @returns {string} The formatrating result
 *
 * @example
 * formatRating(123, 123);
 */

/**
 * Formats rating
 *
 * @param {number} rating - The rating
 * @param {number} [maxRating] - The max rating
 *
 * @returns {string} The formatrating result
 *
 * @example
 * formatRating(123, 123);
 */

export function formatRating(rating: number, maxRating: number = 5): string {
  return `${rating.toFixed(1)} out of ${maxRating}`;
}

/**
 * Format review count (e.g., "1.2K reviews")
 */
/**
 * Formats review count
 *
 * @param {number} count - The count
 *
 * @returns {string} The formatreviewcount result
 *
 * @example
 * formatReviewCount(123);
 */

/**
 * Formats review count
 *
 * @param {number} count - The count
 *
 * @returns {string} The formatreviewcount result
 *
 * @example
 * formatReviewCount(123);
 */

export function formatReviewCount(count: number): string {
  if (count === 0) return "No reviews";
  if (count === 1) return "1 review";
  return `${formatCompactNumber(count)} reviews`;
}

/**
 * Format stock status
 */
/**
 * Formats stock status
 *
 * @param {number} stock - The stock
 *
 * @returns {string} The formatstockstatus result
 *
 * @example
 * formatStockStatus(123);
 */

/**
 * Formats stock status
 *
 * @param {number} stock - The stock
 *
 * @returns {string} The formatstockstatus result
 *
 * @example
 * formatStockStatus(123);
 */

export function formatStockStatus(stock: number): string {
  if (stock === 0) return "Out of Stock";
  if (stock <= 5) return `Only ${stock} left`;
  return "In Stock";
}

/**
 * Format auction time remaining
 */
/**
 * Formats time remaining
 *
 * @param {Date | string | null | undefined} endTime - The end time
 *
 * @returns {string} The formattimeremaining result
 *
 * @example
 * formatTimeRemaining(endTime);
 */

/**
 * Formats time remaining
 *
 * @param {Date | string | null | undefined} /** End Time */
  endTime - The /**  end  time */
  end time
 *
 * @returns {string} The formattimeremaining result
 *
 * @example
 * formatTimeRemaining(/** End Time */
  endTime);
 */

export function formatTimeRemaining(
  /** End Time */
  endTime: Date | string | null | undefined
): string {
  if (!endTime) return "Auction ended";

  const end = typeof endTime === "string" ? new Date(endTime) : endTime;

  // Check if date is valid
  if (!(end instanceof Date) || isNaN(end.getTime())) {
    return "Auction ended";
  }

  const now = new Date();
  const diffInMs = end.getTime() - now.getTime();

  if (diffInMs <= 0) return "Auction ended";

  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Format address for display
 */
/**
 * Formats address
 *
 * @returns {string} The formataddress result
 *
 * @example
 * formatAddress();
 */

/**
 * Formats address
 *
 * @returns {string} The formataddress result
 *
 * @example
 * formatAddress();
 */

export function formatAddress(address: {
  /** Line1 */
  line1: string;
  /** Line2 */
  line2?: string;
  /** City */
  city: string;
  /** State */
  state: string;
  /** Pincode */
  pincode: string;
  /** Country */
  country?: string;
}): string {
  const parts = [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.pincode,
    address.country || "India",
  ].filter(Boolean);

  return parts.join(", ");
}

/**
 * Format card number (mask)
 */
/**
 * Formats card number
 *
 * @param {string} cardNumber - The card number
 *
 * @returns {string} The formatcardnumber result
 *
 * @example
 * formatCardNumber("example");
 */

/**
 * Formats card number
 *
 * @param {string} cardNumber - The card number
 *
 * @returns {string} The formatcardnumber result
 *
 * @example
 * formatCardNumber("example");
 */

export function formatCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, "");
  const masked = "**** **** **** " + cleaned.slice(-4);
  return masked;
}

/**
 * Format UPI ID
 */
/**
 * Formats u p i
 *
 * @param {string} upiId - upi identifier
 *
 * @returns {string} The formatupi result
 *
 * @example
 * formatUPI("example");
 */

/**
 * Formats u p i
 *
 * @param {string} upiId - upi identifier
 *
 * @returns {string} The formatupi result
 *
 * @example
 * formatUPI("example");
 */

export function formatUPI(upiId: string): string {
  return upiId.toLowerCase();
}

/**
 * Format bank account (mask)
 */
/**
 * Formats bank account
 *
 * @param {string} accountNumber - The account number
 *
 * @returns {string} The formatbankaccount result
 *
 * @example
 * formatBankAccount("example");
 */

/**
 * Formats bank account
 *
 * @param {string} accountNumber - The account number
 *
 * @returns {string} The formatbankaccount result
 *
 * @example
 * formatBankAccount("example");
 */

export function formatBankAccount(accountNumber: string): string {
  if (accountNumber.length <= 4) return accountNumber;
  return "*".repeat(accountNumber.length - 4) + accountNumber.slice(-4);
}

/**
 * Format date range
 */
/**
 * Formats date range
 *
 * @param {Date | string} startDate - The start date
 * @param {Date | string} endDate - The end date
 *
 * @returns {string} The formatdaterange result
 *
 * @example
 * formatDateRange(startDate, endDate);
 */

/**
 * Formats date range
 *
 * @returns {any} The formatdaterange result
 *
 * @example
 * formatDateRange();
 */

export function formatDateRange(
  /** Start Date */
  startDate: Date | string,
  /** End Date */
  endDate: Date | string
): string {
  const start = formatDate(startDate, { format: "medium" });
  const end = formatDate(endDate, { format: "medium" });
  return `${start} - ${end}`;
}

/**
 * Format boolean as Yes/No
 */
/**
 * Formats boolean
 *
 * @param {boolean} value - Whether value
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * formatBoolean(true);
 */

/**
 * Formats boolean
 *
 * @param {boolean} value - Whether value
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * formatBoolean(true);
 */

export function formatBoolean(value: boolean): string {
  return value ? "Yes" : "No";
}

/**
 * Format list with commas and "and"
 */
/**
 * Formats list
 *
 * @param {string[]} items - The items
 * @param {string} [locale] - The locale
 *
 * @returns {string} The formatlist result
 *
 * @example
 * formatList(items, "example");
 */

/**
 * Formats list
 *
 * @param {string[]} items - The items
 * @param {string} [locale] - The locale
 *
 * @returns {string} The formatlist result
 *
 * @example
 * formatList(items, "example");
 */

export function formatList(items: string[], locale: string = "en-IN"): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];

  return new Intl.ListFormat(locale, {
    /** Style */
    style: "long",
    /** Type */
    type: "conjunction",
  }).format(items);
}

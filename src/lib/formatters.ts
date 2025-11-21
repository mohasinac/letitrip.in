/**
 * Formatting Utilities
 *
 * Provides consistent formatting for currency, dates, numbers, etc.
 * Used throughout the application for display purposes
 */

/**
 * Format currency in Indian Rupees
 */
export function formatCurrency(
  amount: number,
  options: {
    showDecimals?: boolean;
    showSymbol?: boolean;
    locale?: string;
  } = {}
): string {
  const { showDecimals = true, showSymbol = true, locale = "en-IN" } = options;

  const formatted = new Intl.NumberFormat(locale, {
    style: showSymbol ? "currency" : "decimal",
    currency: "INR",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);

  return formatted;
}

/**
 * Format compact currency (1K, 1L, 1Cr for Indian numbering)
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
  return formatCurrency(amount, { showDecimals: false });
}

/**
 * Format date to localized string
 */
export function formatDate(
  date: Date | string | number,
  options: {
    format?: "short" | "medium" | "long" | "full";
    includeTime?: boolean;
    locale?: string;
  } = {}
): string {
  const { format = "medium", includeTime = false, locale = "en-IN" } = options;

  const dateObj =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;

  const dateFormatOptions: Intl.DateTimeFormatOptions = {
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
export function formatRelativeTime(
  date: Date | string | number,
  options: {
    locale?: string;
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
export function formatNumber(
  num: number,
  options: {
    locale?: string;
    minimumFractionDigits?: number;
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
export function formatCompactNumber(
  num: number,
  locale: string = "en-IN"
): string {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    compactDisplay: "short",
  }).format(num);
}

/**
 * Format percentage
 */
export function formatPercentage(
  value: number,
  options: {
    decimals?: number;
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
 * Format file size
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
export function formatOrderId(id: string): string {
  return `#ORD-${id.slice(-8).toUpperCase()}`;
}

/**
 * Format shop ID (e.g., SHP-12345)
 */
export function formatShopId(id: string): string {
  return `SHP-${id.slice(-8).toUpperCase()}`;
}

/**
 * Format product SKU
 */
export function formatSKU(sku: string): string {
  return sku.toUpperCase();
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Format slug to title
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
export function formatDiscount(
  originalPrice: number,
  currentPrice: number
): string {
  if (originalPrice <= currentPrice) return "0%";
  const discount = ((originalPrice - currentPrice) / originalPrice) * 100;
  return formatPercentage(discount, { decimals: 0 });
}

/**
 * Format rating (e.g., "4.5 out of 5")
 */
export function formatRating(rating: number, maxRating: number = 5): string {
  return `${rating.toFixed(1)} out of ${maxRating}`;
}

/**
 * Format review count (e.g., "1.2K reviews")
 */
export function formatReviewCount(count: number): string {
  if (count === 0) return "No reviews";
  if (count === 1) return "1 review";
  return `${formatCompactNumber(count)} reviews`;
}

/**
 * Format stock status
 */
export function formatStockStatus(stock: number): string {
  if (stock === 0) return "Out of Stock";
  if (stock <= 5) return `Only ${stock} left`;
  return "In Stock";
}

/**
 * Format auction time remaining
 */
export function formatTimeRemaining(
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
export function formatAddress(address: {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
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
export function formatCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, "");
  const masked = "**** **** **** " + cleaned.slice(-4);
  return masked;
}

/**
 * Format UPI ID
 */
export function formatUPI(upiId: string): string {
  return upiId.toLowerCase();
}

/**
 * Format bank account (mask)
 */
export function formatBankAccount(accountNumber: string): string {
  if (accountNumber.length <= 4) return accountNumber;
  return "*".repeat(accountNumber.length - 4) + accountNumber.slice(-4);
}

/**
 * Format date range
 */
export function formatDateRange(
  startDate: Date | string,
  endDate: Date | string
): string {
  const start = formatDate(startDate, { format: "medium" });
  const end = formatDate(endDate, { format: "medium" });
  return `${start} - ${end}`;
}

/**
 * Format boolean as Yes/No
 */
export function formatBoolean(value: boolean): string {
  return value ? "Yes" : "No";
}

/**
 * Format list with commas and "and"
 */
export function formatList(items: string[], locale: string = "en-IN"): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];

  return new Intl.ListFormat(locale, {
    style: "long",
    type: "conjunction",
  }).format(items);
}

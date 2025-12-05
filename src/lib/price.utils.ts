/**
 * Price formatting utilities with null safety
 * Centralized place for all price-related formatting
 */

export type Currency = "INR" | "USD" | "EUR" | "GBP";

interface CurrencyConfig {
  symbol: string;
  locale: string;
  position: "before" | "after";
}

const CURRENCY_CONFIGS: Record<Currency, CurrencyConfig> = {
  INR: { symbol: "₹", locale: "en-IN", position: "before" },
  USD: { symbol: "$", locale: "en-US", position: "before" },
  EUR: { symbol: "€", locale: "de-DE", position: "after" },
  GBP: { symbol: "£", locale: "en-GB", position: "before" },
};

/**
 * Safely formats a price value to localized string
 * Returns "N/A" if value is null/undefined/NaN
 *
 * @param value - The price value to format
 * @param currency - Currency code (default: INR)
 * @param showSymbol - Whether to show currency symbol (default: true)
 * @returns Formatted price string or "N/A"
 */
export interface FormatPriceOptions {
  currency?: Currency;
  showSymbol?: boolean;
  showDecimals?: boolean;
}

export function formatPrice(
  value: number | null | undefined,
  options: FormatPriceOptions = {}
): string {
  const { currency = "INR", showSymbol = true, showDecimals = true } = options;

  // Handle null, undefined, NaN
  if (value == null || isNaN(value)) {
    return "N/A";
  }

  const config = CURRENCY_CONFIGS[currency];
  const formattedNumber = value.toLocaleString(config.locale, {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });

  if (!showSymbol) {
    return formattedNumber;
  }

  return config.position === "before"
    ? `${config.symbol}${formattedNumber}`
    : `${formattedNumber}${config.symbol}`;
}

/**
 * Safely converts a price to localized string without symbol
 * Returns "0" if value is null/undefined/NaN
 *
 * @param value - The price value to format
 * @param locale - Locale code (default: en-IN)
 * @returns Formatted number string or "0"
 */
export function safeToLocaleString(
  value: number | null | undefined,
  locale: string = "en-IN"
): string {
  if (value == null || isNaN(value)) {
    return "0";
  }
  return value.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/**
 * Formats a price range (e.g., "₹100 - ₹500")
 *
 * @param min - Minimum price
 * @param max - Maximum price
 * @param currency - Currency code (default: INR)
 * @returns Formatted price range or "N/A"
 */
export function formatPriceRange(
  min: number | null | undefined,
  max: number | null | undefined,
  currency: Currency = "INR"
): string {
  if (min == null || max == null || isNaN(min) || isNaN(max)) {
    return "N/A";
  }

  if (min === max) {
    return formatPrice(min, { currency });
  }

  return `${formatPrice(min, { currency })} - ${formatPrice(max, {
    currency,
  })}`;
}

/**
 * Calculates and formats discount percentage
 *
 * @param originalPrice - Original/compare price
 * @param currentPrice - Current/sale price
 * @returns Formatted discount percentage (e.g., "-25%") or null
 */
export function formatDiscount(
  originalPrice: number | null | undefined,
  currentPrice: number | null | undefined
): string | null {
  if (
    originalPrice == null ||
    currentPrice == null ||
    isNaN(originalPrice) ||
    isNaN(currentPrice) ||
    originalPrice <= currentPrice
  ) {
    return null;
  }

  const discount = ((originalPrice - currentPrice) / originalPrice) * 100;
  return `-${Math.round(discount)}%`;
}

/**
 * Formats price with currency symbol (INR only for now)
 * Alias for formatPrice with default INR
 *
 * @param value - The price value to format
 * @returns Formatted price with ₹ symbol or "N/A"
 */
export function formatINR(value: number | null | undefined): string {
  return formatPrice(value, { currency: "INR", showSymbol: true });
}

/**
 * Parses a string to a safe number for price operations
 *
 * @param value - String value to parse
 * @returns Parsed number or 0 if invalid
 */
export function parsePrice(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = parseFloat(value.replace(/[^\d.-]/g, ""));
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * @fileoverview Utility Functions
 * @module src/lib/price.utils
 * @description This file contains utility functions for price
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Price formatting utilities with null safety
 * Centralized place for all price-related formatting
 */

/**
 * Currency type definition
 * @typedef {Currency}
 */
export type Currency = "INR" | "USD" | "EUR" | "GBP";

/**
 * CurrencyConfig interface
 * 
 * @interface
 * @description Defines the structure and contract for CurrencyConfig
 */
interface CurrencyConfig {
  /** Symbol */
  symbol: string;
  /** Locale */
  locale: string;
  /** Position */
  position: "before" | "after";
}

const CURRENCY_CONFIGS: Record<Currency, CurrencyConfig> = {
  /** I N R */
  INR: { symbol: "₹", locale: "en-IN", position: "before" },
  /** U S D */
  USD: { symbol: "$", locale: "en-US", position: "before" },
  /** E U R */
  EUR: { symbol: "€", locale: "de-DE", position: "after" },
  /** G B P */
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
  /** Currency */
  currency?: Currency;
  /** Show Symbol */
  showSymbol?: boolean;
  /** Show Decimals */
  showDecimals?: boolean;
}

/**
 * Function: Format Price
 */
/**
 * Formats price
 *
 * @param {number | null | undefined} value - The value
 * @param {FormatPriceOptions} [options] - Configuration options
 *
 * @returns {string} The formatprice result
 *
 * @example
 * formatPrice(value, options);
 */

/**
 * Formats price
 *
 * @returns {number} The formatprice result
 *
 * @example
 * formatPrice();
 */

export function formatPrice(
  /** Value */
  value: number | null | undefined,
  /** Options */
  options: FormatPriceOptions = {}
): string {
  const { currency = "INR", showSymbol = true, showDecimals = true } = options;

  // Handle null, undefined, NaN
  if (value == null || isNaN(value)) {
    return "N/A";
  }

  const config = CURRENCY_CONFIGS[currency];
  const formattedNumber = value.toLocaleString(config.locale, {
    /** Minimum Fraction Digits */
    minimumFractionDigits: showDecimals ? 2 : 0,
    /** Maximum Fraction Digits */
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
/**
 * Performs safe to locale string operation
 *
 * @param {number | null | undefined} value - The value
 * @param {string} [locale] - The locale
 *
 * @returns {string} The safetolocalestring result
 *
 * @example
 * safeToLocaleString(value, "example");
 */

/**
 * Performs safe to locale string operation
 *
 * @returns {string} The safetolocalestring result
 *
 * @example
 * safeToLocaleString();
 */

export function safeToLocaleString(
  /** Value */
  value: number | null | undefined,
  /** Locale */
  locale: string = "en-IN"
): string {
  if (value == null || isNaN(value)) {
    return "0";
  }
  return value.toLocaleString(locale, {
    /** Minimum Fraction Digits */
    minimumFractionDigits: 0,
    /** Maximum Fraction Digits */
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
/**
 * Formats price range
 *
 * @param {number | null | undefined} min - The min
 * @param {number | null | undefined} max - The max
 * @param {Currency} [currency] - The currency
 *
 * @returns {string} The formatpricerange result
 *
 * @example
 * formatPriceRange(min, max, currency);
 */

/**
 * Formats price range
 *
 * @returns {number} The formatpricerange result
 *
 * @example
 * formatPriceRange();
 */

export function formatPriceRange(
  /** Min */
  min: number | null | undefined,
  /** Max */
  max: number | null | undefined,
  /** Currency */
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
/**
 * Formats discount
 *
 * @param {number | null | undefined} originalPrice - The original price
 * @param {number | null | undefined} currentPrice - The current price
 *
 * @returns {string} The formatdiscount result
 *
 * @example
 * formatDiscount(originalPrice, currentPrice);
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
  originalPrice: number | null | undefined,
  /** Current Price */
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
  return `-${Math.round(discount)}%`;
}

/**
 * Formats price with currency symbol (INR only for now)
 * Alias for formatPrice with default INR
 *
 * @param value - The price value to format
 * @returns Formatted price with ₹ symbol or "N/A"
 */
/**
 * Formats i n r
 *
 * @param {number | null | undefined} value - The value
 *
 * @returns {string} The formatinr result
 *
 * @example
 * formatINR(value);
 */

/**
 * Formats i n r
 *
 * @param {number | null | undefined} value - The value
 *
 * @returns {string} The formatinr result
 *
 * @example
 * formatINR(value);
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
/**
 * Parses price
 *
 * @param {string | null | undefined} value - The value
 *
 * @returns {string} The parseprice result
 *
 * @example
 * parsePrice(value);
 */

/**
 * Parses price
 *
 * @param {string | null | undefined} value - The value
 *
 * @returns {string} The parseprice result
 *
 * @example
 * parsePrice(value);
 */

export function parsePrice(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = parseFloat(value.replace(/[^\d.-]/g, ""));
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * @fileoverview React Component
 * @module src/components/common/values/Currency
 * @description This file contains the Currency component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Currency Display Component
 *
 * Displays currency values with proper symbol and formatting.
 * Supports multiple currencies with INR as default.
 *
 * @example
 * <Currency amount={1499} />              // ₹1,499
 * <Currency amount={1499} code="USD" />   // $1,499
 */

"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * CurrencyCode type
 * 
 * @typedef {Object} CurrencyCode
 * @description Type definition for CurrencyCode
 */
type CurrencyCode = "INR" | "USD" | "EUR" | "GBP";

/**
 * CurrencyProps interface
 * 
 * @interface
 * @description Defines the structure and contract for CurrencyProps
 */
interface CurrencyProps {
  /** Amount */
  amount: number;
  /** Code */
  code?: CurrencyCode;
  /** Show Decimals */
  showDecimals?: boolean;
  /** Class Name */
  className?: string;
}

const currencyLocales: Record<CurrencyCode, string> = {
  /** I N R */
  INR: "en-IN",
  /** U S D */
  USD: "en-US",
  /** E U R */
  EUR: "de-DE",
  /** G B P */
  GBP: "en-GB",
};

/**
 * Function: Currency
 */
/**
 * Performs currency operation
 *
 * @returns {any} The currency result
 *
 * @example
 * Currency();
 */

/**
 * Performs currency operation
 *
 * @returns {any} The currency result
 *
 * @example
 * Currency();
 */

export function Currency({
  amount,
  code = "INR",
  showDecimals = false,
  className,
}: CurrencyProps) {
  const formatted = new Intl.NumberFormat(currencyLocales[code], {
    /** Style */
    style: "currency",
    /** Currency */
    currency: code,
    /** Minimum Fraction Digits */
    minimumFractionDigits: showDecimals ? 2 : 0,
    /** Maximum Fraction Digits */
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);

  return (
    <span
      className={cn("font-medium text-gray-900 dark:text-white", className)}
    >
      {formatted}
    </span>
  );
}

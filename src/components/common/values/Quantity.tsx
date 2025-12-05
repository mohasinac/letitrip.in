/**
 * @fileoverview React Component
 * @module src/components/common/values/Quantity
 * @description This file contains the Quantity component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Quantity Display Component
 *
 * Displays quantities with proper formatting for stock, cart items, etc.
 *
 * @example
 * <Quantity value={5} />                            // 5
 * <Quantity value={5} suffix="items" />             // 5 items
 * <Quantity value={1500} compact />                 // 1.5K
 * <Quantity value={0} zeroText="Out of Stock" />    // Out of Stock
 */

"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * QuantityProps interface
 * 
 * @interface
 * @description Defines the structure and contract for QuantityProps
 */
interface QuantityProps {
  /** Value */
  value: number;
  /** Suffix */
  suffix?: string;
  /** Prefix */
  prefix?: string;
  /** Compact */
  compact?: boolean;
  /** Zero Text */
  zeroText?: string;
  /** Class Name */
  className?: string;
  showSign?: boolean; // Show +/- for changes
}

/**
 * Function: Format Compact Number
 */
/**
 * Formats compact number
 *
 * @param {number} num - The num
 *
 * @returns {string} The formatcompactnumber result
 */

/**
 * Formats compact number
 *
 * @param {number} num - The num
 *
 * @returns {string} The formatcompactnumber result
 */

function formatCompactNumber(num: number): string {
  if (num >= 10000000) {
    return `${(num / 10000000).toFixed(1).replace(/\.0$/, "")}Cr`;
  }
  if (num >= 100000) {
    return `${(num / 100000).toFixed(1).replace(/\.0$/, "")}L`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return num.toString();
}

/**
 * Function: Quantity
 */
/**
 * Performs quantity operation
 *
 * @returns {any} The quantity result
 *
 * @example
 * Quantity();
 */

/**
 * Performs quantity operation
 *
 * @returns {any} The quantity result
 *
 * @example
 * Quantity();
 */

export function Quantity({
  value,
  suffix,
  prefix,
  compact = false,
  zeroText,
  className,
  showSign = false,
}: QuantityProps) {
  if (value === 0 && zeroText) {
    return (
      <span className={cn("text-gray-500 dark:text-gray-400", className)}>
        {zeroText}
      </span>
    );
  }

  const formattedValue = compact
    ? formatCompactNumber(value)
    : value.toLocaleString("en-IN");
  const sign = showSign && value > 0 ? "+" : "";

  return (
    <span className={cn("text-gray-900 dark:text-white", className)}>
      {prefix && (
        <span className="text-gray-500 dark:text-gray-400 mr-1">{prefix}</span>
      )}
      {sign}
      {formattedValue}
      {suffix && (
        <span className="text-gray-500 dark:text-gray-400 ml-1">{suffix}</span>
      )}
    </span>
  );
}

export default Quantity;

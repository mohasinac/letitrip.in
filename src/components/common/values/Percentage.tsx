/**
 * @fileoverview React Component
 * @module src/components/common/values/Percentage
 * @description This file contains the Percentage component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Percentage Display Component
 *
 * Displays percentages with proper formatting and optional color coding.
 *
 * @example
 * <Percentage value={25} />                    // 25%
 * <Percentage value={-10} showSign />          // -10%
 * <Percentage value={25} type="discount" />    // 25% off (green)
 * <Percentage value={15} type="increase" />    // +15% (red for price increase)
 */

"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * PercentageProps interface
 * 
 * @interface
 * @description Defines the structure and contract for PercentageProps
 */
interface PercentageProps {
  /** Value */
  value: number;
  /** Show Sign */
  showSign?: boolean;
  /** Show Icon */
  showIcon?: boolean;
  /** Type */
  type?: "neutral" | "discount" | "increase" | "decrease";
  /** Suffix */
  suffix?: string;
  /** Precision */
  precision?: number;
  /** Class Name */
  className?: string;
}

/**
 * Function: Percentage
 */
/**
 * Performs percentage operation
 *
 * @returns {any} The percentage result
 *
 * @example
 * Percentage();
 */

/**
 * Performs percentage operation
 *
 * @returns {any} The percentage result
 *
 * @example
 * Percentage();
 */

export function Percentage({
  value,
  showSign = false,
  showIcon = false,
  type = "neutral",
  suffix = "%",
  precision = 0,
  className,
}: PercentageProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const sign = showSign && isPositive ? "+" : "";

  const formattedValue =
    precision > 0
      ? Math.abs(value).toFixed(precision)
      : Math.abs(value).toString();

  const colorClasses = {
    /** Neutral */
    neutral: "text-gray-700 dark:text-gray-300",
    /** Discount */
    discount: "text-green-600 dark:text-green-400",
    /** Increase */
    increase: "text-red-600 dark:text-red-400",
    /** Decrease */
    decrease: "text-green-600 dark:text-green-400",
  };

  const suffixText = type === "discount" ? "% off" : suffix;

  // Determine if icon shows up or down
  const showUpIcon = type === "increase" || (type === "neutral" && isPositive);
  const showDownIcon =
    type === "decrease" ||
    type === "discount" ||
    (type === "neutral" && isNegative);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium",
        colorClasses[type],
        className,
      )}
    >
      {showIcon && (
        <>
          {showUpIcon && <TrendingUp className="w-4 h-4" />}
          {showDownIcon && <TrendingDown className="w-4 h-4" />}
        </>
      )}
      {sign}
      {isNegative && "-"}
      {formattedValue}
      {suffixText}
    </span>
  );
}

export default Percentage;

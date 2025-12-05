/**
 * @fileoverview React Component
 * @module src/components/common/values/Price
 * @description This file contains the Price component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Price Display Component
 *
 * Displays prices in Indian Rupees with proper formatting.
 * Use this instead of manual ₹ formatting throughout the app.
 *
 * @example
 * <Price amount={1499.99} />                    // ₹1,499.99
 * <Price amount={1499} showDecimals={false} />  // ₹1,499
 * <Price amount={1499} originalPrice={1999} />  // ₹1,499 (strikethrough ₹1,999)
 * <CompactPrice amount={150000} />              // ₹1.5L
 */

"use client";

import { formatCompactCurrency, formatDiscount } from "@/lib/formatters";
import { formatPrice } from "@/lib/price.utils";
import { cn } from "@/lib/utils";

/**
 * PriceProps interface
 * 
 * @interface
 * @description Defines the structure and contract for PriceProps
 */
interface PriceProps {
  /** Amount */
  amount: number;
  /** Original Price */
  originalPrice?: number;
  /** Show Decimals */
  showDecimals?: boolean;
  /** Show Symbol */
  showSymbol?: boolean;
  /** Size */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Class Name */
  className?: string;
  /** Strikethrough Class Name */
  strikethroughClassName?: string;
  /** Show Discount */
  showDiscount?: boolean;
}

const sizeClasses = {
  /** Xs */
  xs: "text-xs",
  /** Sm */
  sm: "text-sm",
  /** Md */
  md: "text-base",
  /** Lg */
  lg: "text-lg",
  /** Xl */
  xl: "text-xl",
};

/**
 * Function: Price
 */
/**
 * Performs price operation
 *
 * @returns {any} The price result
 *
 * @example
 * Price();
 */

/**
 * Performs price operation
 *
 * @returns {any} The price result
 *
 * @example
 * Price();
 */

export function Price({
  amount,
  originalPrice,
  showDecimals = false,
  showSymbol = true,
  size = "md",
  className,
  strikethroughClassName,
  showDiscount = true,
}: PriceProps) {
  const formattedPrice = formatPrice(amount, {
    showDecimals,
    /** Show Symbol */
    showSymbol: showSymbol,
  });
  const hasDiscount = originalPrice && originalPrice > amount;
  const discountPercent = hasDiscount
    ? formatDiscount(originalPrice, amount)
    : null;

  return (
    <span
      className={cn("inline-flex items-baseline gap-2 flex-wrap", className)}
    >
      <span
        className={cn(
          "font-semibold text-gray-900 dark:text-white",
          sizeClasses[size]
        )}
      >
        {formattedPrice}
      </span>

      {hasDiscount && (
        <>
          <span
            className={cn(
              "line-through text-gray-500 dark:text-gray-400",
              size === "xl"
                ? "text-base"
                : size === "lg"
                ? "text-sm"
                : "text-xs",
              strikethroughClassName
            )}
          >
            {formatPrice(originalPrice, {
              showDecimals,
              /** Show Symbol */
              showSymbol: showSymbol,
            })}
          </span>

          {showDiscount && discountPercent && (
            <span className="text-green-600 dark:text-green-400 text-xs font-medium">
              {discountPercent} off
            </span>
          )}
        </>
      )}
    </span>
  );
}

/**
 * CompactPriceProps interface
 * 
 * @interface
 * @description Defines the structure and contract for CompactPriceProps
 */
interface CompactPriceProps {
  /** Amount */
  amount: number;
  /** Class Name */
  className?: string;
}

/**
 * Function: Compact Price
 */
/**
 * Performs compact price operation
 *
 * @param {CompactPriceProps} { amount, className } - The { amount, class name }
 *
 * @returns {any} The compactprice result
 *
 * @example
 * CompactPrice({ amount, className });
 */

/**
 * Performs compact price operation
 *
 * @param {CompactPriceProps} { amount, className } - The { amount, class name }
 *
 * @returns {any} The compactprice result
 *
 * @example
 * CompactPrice({ amount, className });
 */

export function CompactPrice({ amount, className }: CompactPriceProps) {
  return (
    <span
      className={cn("font-semibold text-gray-900 dark:text-white", className)}
    >
      {formatCompactCurrency(amount)}
    </span>
  );
}

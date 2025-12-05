/**
 * @fileoverview React Component
 * @module src/components/common/values/BidCount
 * @description This file contains the BidCount component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Bid Count Display Component
 *
 * Displays auction bid count with proper pluralization.
 *
 * @example
 * <BidCount count={0} />                    // No bids
 * <BidCount count={1} />                    // 1 bid
 * <BidCount count={25} />                   // 25 bids
 * <BidCount count={25} compact />           // 25
 */

"use client";

import React from "react";
import { Gavel } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * BidCountProps interface
 * 
 * @interface
 * @description Defines the structure and contract for BidCountProps
 */
interface BidCountProps {
  /** Count */
  count: number;
  /** Show Icon */
  showIcon?: boolean;
  /** Compact */
  compact?: boolean;
  /** Class Name */
  className?: string;
  /** Size */
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  /** Sm */
  sm: "text-xs",
  /** Md */
  md: "text-sm",
  /** Lg */
  lg: "text-base",
};

const iconSizes = {
  /** Sm */
  sm: 12,
  /** Md */
  md: 14,
  /** Lg */
  lg: 16,
};

/**
 * Function: Bid Count
 */
/**
 * Performs bid count operation
 *
 * @returns {any} The bidcount result
 *
 * @example
 * BidCount();
 */

/**
 * Performs bid count operation
 *
 * @returns {any} The bidcount result
 *
 * @example
 * BidCount();
 */

export function BidCount({
  count,
  showIcon = false,
  compact = false,
  className,
  size = "md",
}: BidCountProps) {
  if (count === 0 && !compact) {
    return (
      <span
        className={cn(
          "text-gray-500 dark:text-gray-400",
          sizeClasses[size],
          className,
        )}
      >
        {showIcon && (
          <Gavel className="inline-block mr-1" size={iconSizes[size]} />
        )}
        No bids
      </span>
    );
  }

  const label = compact ? "" : count === 1 ? " bid" : " bids";

  return (
    <span
      className={cn(
        "text-gray-700 dark:text-gray-300",
        sizeClasses[size],
        className,
      )}
    >
      {showIcon && (
        <Gavel className="inline-block mr-1" size={iconSizes[size]} />
      )}
      <span className="font-medium">{count.toLocaleString("en-IN")}</span>
      {label}
    </span>
  );
}

export default BidCount;

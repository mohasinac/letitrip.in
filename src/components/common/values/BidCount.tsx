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

interface BidCountProps {
  count: number;
  showIcon?: boolean;
  compact?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

const iconSizes = {
  sm: 12,
  md: 14,
  lg: 16,
};

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

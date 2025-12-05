/**
 * @fileoverview React Component
 * @module src/components/common/values/StockStatus
 * @description This file contains the StockStatus component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Stock Status Display Component
 *
 * Displays stock availability with appropriate colors.
 *
 * @example
 * <StockStatus count={50} />        // In Stock (green)
 * <StockStatus count={3} />         // Only 3 left (orange)
 * <StockStatus count={0} />         // Out of Stock (red)
 */

"use client";

import React from "react";
import { AlertTriangle, XCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * StockStatusProps interface
 * 
 * @interface
 * @description Defines the structure and contract for StockStatusProps
 */
interface StockStatusProps {
  /** Count */
  count: number;
  /** Low Stock Threshold */
  lowStockThreshold?: number;
  /** Show Count */
  showCount?: boolean;
  /** Show Icon */
  showIcon?: boolean;
  /** Size */
  size?: "sm" | "md" | "lg";
  /** Class Name */
  className?: string;
}

const sizeClasses = {
  /** Sm */
  sm: "text-xs px-2 py-0.5",
  /** Md */
  md: "text-sm px-2.5 py-1",
  /** Lg */
  lg: "text-base px-3 py-1.5",
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
 * Function: Stock Status
 */
/**
 * Performs stock status operation
 *
 * @returns {any} The stockstatus result
 *
 * @example
 * StockStatus();
 */

/**
 * Performs stock status operation
 *
 * @returns {any} The stockstatus result
 *
 * @example
 * StockStatus();
 */

export function StockStatus({
  count,
  lowStockThreshold = 5,
  showCount = true,
  showIcon = true,
  size = "md",
  className,
}: StockStatusProps) {
  const isOutOfStock = count === 0;
  const isLowStock = count > 0 && count <= lowStockThreshold;

  let Icon: React.ElementType;
  let colors: string;
  let label: string;

  if (isOutOfStock) {
    Icon = XCircle;
    colors = "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    label = "Out of Stock";
  } else if (isLowStock) {
    Icon = AlertTriangle;
    colors =
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    label = showCount ? `Only ${count} left` : "Low Stock";
  } else {
    Icon = CheckCircle2;
    colors =
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    label = showCount ? `${count} in stock` : "In Stock";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full",
        colors,
        sizeClasses[size],
        className,
      )}
    >
      {showIcon && <Icon size={iconSizes[size]} />}
      {label}
    </span>
  );
}

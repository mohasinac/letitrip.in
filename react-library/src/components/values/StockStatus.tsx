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
import { cn } from "../../utils/cn";

interface StockStatusProps {
  count: number;
  lowStockThreshold?: number;
  showCount?: boolean;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
  lg: "text-base px-3 py-1.5",
};

const iconSizes = {
  sm: 12,
  md: 14,
  lg: 16,
};

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

/**
 * Shipping Status Display Component
 *
 * Displays shipping status with appropriate colors and icons.
 *
 * @example
 * <ShippingStatus status="shipped" />      // 🚚 Shipped (blue)
 * <ShippingStatus status="delivered" />    // ✅ Delivered (green)
 */

"use client";

import React from "react";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ShippingStatusType =
  | "pending"
  | "processing"
  | "shipped"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "returned"
  | "failed";

interface ShippingStatusProps {
  status: ShippingStatusType;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const statusConfig: Record<
  ShippingStatusType,
  {
    label: string;
    icon: React.ElementType;
    colors: string;
  }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    colors: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  },
  processing: {
    label: "Processing",
    icon: Package,
    colors:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    colors: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  in_transit: {
    label: "In Transit",
    icon: Truck,
    colors: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    icon: MapPin,
    colors:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle2,
    colors:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  returned: {
    label: "Returned",
    icon: RotateCcw,
    colors:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    colors: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

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

export function ShippingStatus({
  status,
  showIcon = true,
  size = "md",
  className,
}: ShippingStatusProps) {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full",
        config.colors,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon size={iconSizes[size]} />}
      {config.label}
    </span>
  );
}

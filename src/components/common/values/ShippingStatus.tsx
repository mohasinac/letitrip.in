/**
 * @fileoverview React Component
 * @module src/components/common/values/ShippingStatus
 * @description This file contains the ShippingStatus component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

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

/**
 * ShippingStatusType type
 * 
 * @typedef {Object} ShippingStatusType
 * @description Type definition for ShippingStatusType
 */
type ShippingStatusType =
  | "pending"
  | "processing"
  | "shipped"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "returned"
  | "failed";

/**
 * ShippingStatusProps interface
 * 
 * @interface
 * @description Defines the structure and contract for ShippingStatusProps
 */
interface ShippingStatusProps {
  /** Status */
  status: ShippingStatusType;
  /** Show Icon */
  showIcon?: boolean;
  /** Size */
  size?: "sm" | "md" | "lg";
  /** Class Name */
  className?: string;
}

const statusConfig: Record<
  ShippingStatusType,
  {
    /** Label */
    label: string;
    /** Icon */
    icon: React.ElementType;
    /** Colors */
    colors: string;
  }
> = {
  /** Pending */
  pending: {
    /** Label */
    label: "Pending",
    /** Icon */
    icon: Clock,
    /** Colors */
    colors: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  },
  /** Processing */
  processing: {
    /** Label */
    label: "Processing",
    /** Icon */
    icon: Package,
    /** Colors */
    colors:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  /** Shipped */
  shipped: {
    /** Label */
    label: "Shipped",
    /** Icon */
    icon: Truck,
    /** Colors */
    colors: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  in_transit: {
    /** Label */
    label: "In Transit",
    /** Icon */
    icon: Truck,
    /** Colors */
    colors: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  out_for_delivery: {
    /** Label */
    label: "Out for Delivery",
    /** Icon */
    icon: MapPin,
    /** Colors */
    colors:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  /** Delivered */
  delivered: {
    /** Label */
    label: "Delivered",
    /** Icon */
    icon: CheckCircle2,
    /** Colors */
    colors:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  /** Returned */
  returned: {
    /** Label */
    label: "Returned",
    /** Icon */
    icon: RotateCcw,
    /** Colors */
    colors:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
  /** Failed */
  failed: {
    /** Label */
    label: "Failed",
    /** Icon */
    icon: XCircle,
    /** Colors */
    colors: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

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
 * Function: Shipping Status
 */
/**
 * Performs shipping status operation
 *
 * @returns {any} The shippingstatus result
 *
 * @example
 * ShippingStatus();
 */

/**
 * Performs shipping status operation
 *
 * @returns {any} The shippingstatus result
 *
 * @example
 * ShippingStatus();
 */

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
        className,
      )}
    >
      {showIcon && <Icon size={iconSizes[size]} />}
      {config.label}
    </span>
  );
}

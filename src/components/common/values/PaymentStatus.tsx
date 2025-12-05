/**
 * @fileoverview React Component
 * @module src/components/common/values/PaymentStatus
 * @description This file contains the PaymentStatus component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Payment Status Display Component
 *
 * Displays payment status with appropriate colors and icons.
 *
 * @example
 * <PaymentStatus status="paid" />          // ✅ Paid (green)
 * <PaymentStatus status="pending" />       // 🕐 Pending (yellow)
 * <PaymentStatus status="failed" />        // ❌ Failed (red)
 */

"use client";

import React from "react";
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  RotateCcw,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * PaymentStatusType type
 * 
 * @typedef {Object} PaymentStatusType
 * @description Type definition for PaymentStatusType
 */
type PaymentStatusType =
  | "pending"
  | "processing"
  | "paid"
  | "completed"
  | "failed"
  | "refunded"
  | "partially_refunded"
  | "cancelled";

/**
 * PaymentStatusProps interface
 * 
 * @interface
 * @description Defines the structure and contract for PaymentStatusProps
 */
interface PaymentStatusProps {
  /** Status */
  status: PaymentStatusType;
  /** Show Icon */
  showIcon?: boolean;
  /** Size */
  size?: "sm" | "md" | "lg";
  /** Class Name */
  className?: string;
}

const statusConfig: Record<
  PaymentStatusType,
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
    colors:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  /** Processing */
  processing: {
    /** Label */
    label: "Processing",
    /** Icon */
    icon: CreditCard,
    /** Colors */
    colors: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  /** Paid */
  paid: {
    /** Label */
    label: "Paid",
    /** Icon */
    icon: CheckCircle2,
    /** Colors */
    colors:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  /** Completed */
  completed: {
    /** Label */
    label: "Completed",
    /** Icon */
    icon: CheckCircle2,
    /** Colors */
    colors:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
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
  /** Refunded */
  refunded: {
    /** Label */
    label: "Refunded",
    /** Icon */
    icon: RotateCcw,
    /** Colors */
    colors:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  partially_refunded: {
    /** Label */
    label: "Partially Refunded",
    /** Icon */
    icon: RotateCcw,
    /** Colors */
    colors:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
  /** Cancelled */
  cancelled: {
    /** Label */
    label: "Cancelled",
    /** Icon */
    icon: AlertCircle,
    /** Colors */
    colors: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
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
 * Function: Payment Status
 */
/**
 * Performs payment status operation
 *
 * @returns {any} The paymentstatus result
 *
 * @example
 * PaymentStatus();
 */

/**
 * Performs payment status operation
 *
 * @returns {any} The paymentstatus result
 *
 * @example
 * PaymentStatus();
 */

export function PaymentStatus({
  status,
  showIcon = true,
  size = "md",
  className,
}: PaymentStatusProps) {
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
